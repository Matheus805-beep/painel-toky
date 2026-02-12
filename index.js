const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const TOKEN = process.env.TOKEN;

const ORG_NAME = "ORG TK";

const MODES = {
  "1v1": 2,
  "2v2": 4,
  "3v3": 6,
  "4v4": 8
};

const VALORES = ["R$5", "R$10", "R$20", "R$50"];

let filas = {};
let config = {
  categoriaId: null,
  logsId: null
};

client.once("ready", async () => {
  console.log(`${ORG_NAME} Online ✅`);

  const commands = [
    new SlashCommandBuilder()
      .setName("config")
      .setDescription("Configurar sistema")
      .addSubcommand(sub =>
        sub.setName("categoria")
          .setDescription("Definir categoria onde as partidas serão criadas")
          .addChannelOption(opt =>
            opt.setName("canal")
              .setDescription("Categoria")
              .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName("logs")
          .setDescription("Definir canal de logs")
          .addChannelOption(opt =>
            opt.setName("canal")
              .setDescription("Canal de logs")
              .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName("reset")
          .setDescription("Resetar todas as filas")
      )
  ];

  await client.application.commands.set(commands);
});

client.on("interactionCreate", async (interaction) => {

  // ===== CONFIG SLASH =====
  if (interaction.isChatInputCommand()) {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "Apenas administradores podem usar isso.", ephemeral: true });
    }

    if (interaction.options.getSubcommand() === "categoria") {
      config.categoriaId = interaction.options.getChannel("canal").id;
      return interaction.reply({ content: "Categoria configurada ✅", ephemeral: true });
    }

    if (interaction.options.getSubcommand() === "logs") {
      config.logsId = interaction.options.getChannel("canal").id;
      return interaction.reply({ content: "Canal de logs configurado ✅", ephemeral: true });
    }

    if (interaction.options.getSubcommand() === "reset") {
      filas = {};
      return interaction.reply({ content: "Filas resetadas ✅", ephemeral: true });
    }
  }

  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  try {

    // ===== ENTRAR =====
    if (interaction.customId === "entrar") {
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("modo")
          .setPlaceholder("Escolha o modo")
          .addOptions(
            Object.keys(MODES).map(m => ({
              label: m,
              value: m
            }))
          )
      );

      return interaction.reply({
        content: "Escolha o modo:",
        components: [menu],
        ephemeral: true
      });
    }

    // ===== SAIR =====
    if (interaction.customId === "sair") {
      for (let chave in filas) {
        filas[chave] = filas[chave].filter(id => id !== interaction.user.id);
      }
      return interaction.reply({ content: "Você saiu da fila ✅", ephemeral: true });
    }

    // ===== ESCOLHER MODO =====
    if (interaction.customId === "modo") {
      const modo = interaction.values[0];

      const menuValor = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`valor_${modo}`)
          .setPlaceholder("Escolha o valor")
          .addOptions(
            VALORES.map(v => ({
              label: v,
              value: v
            }))
          )
      );

      return interaction.update({
        content: `Modo ${modo} selecionado. Escolha o valor:`,
        components: [menuValor]
      });
    }

    // ===== ESCOLHER VALOR =====
    if (interaction.customId.startsWith("valor_")) {
      const modo = interaction.customId.split("_")[1];
      const valor = interaction.values[0];
      const chave = `${modo}_${valor}`;

      if (!filas[chave]) filas[chave] = [];

      if (!filas[chave].includes(interaction.user.id)) {
        filas[chave].push(interaction.user.id);
      }

      await interaction.reply({
        content: `Você entrou na fila ${modo} - ${valor}\n${filas[chave].length}/${MODES[modo]}`,
        ephemeral: true
      });

      // ===== COMPLETOU =====
      if (filas[chave].length >= MODES[modo]) {

        const membros = filas[chave];

        const canal = await interaction.guild.channels.create({
          name: `🎮-${modo}-${valor.replace("R$", "")}`,
          type: ChannelType.GuildText,
          parent: config.categoriaId || null,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            ...membros.map(id => ({
              id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
              ]
            }))
          ]
        });

        canal.send(`🔥 Partida criada!\n${membros.map(id => `<@${id}>`).join(" ")}`);

        // LOG
        if (config.logsId) {
          const logChannel = interaction.guild.channels.cache.get(config.logsId);
          if (logChannel) {
            logChannel.send(`Partida criada: ${modo} - ${valor}`);
          }
        }

        // RESET AUTOMÁTICO DA FILA
        filas[chave] = [];
      }
    }

  } catch (err) {
    console.log(err);
  }
});

client.login(TOKEN);