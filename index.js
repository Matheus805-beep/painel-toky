const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const filas = {};

const modos = {
  "1v1": 2,
  "2v2": 4,
  "3v3": 6,
  "4v4": 8
};

const valores = [1, 5, 10, 20, 50, 100];

client.once("ready", async () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName("painel")
      .setDescription("Abrir painel de filas")
      .toJSON()
  ];

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("✅ Comando /painel registrado!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  // ===== COMANDO /painel =====
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "painel") {

      const embed = new EmbedBuilder()
        .setTitle("🎮 PAINEL DE FILAS")
        .setDescription("Escolha o modo da partida:")
        .setColor("#5865F2");

      const row = new ActionRowBuilder().addComponents(
        Object.keys(modos).map(modo =>
          new ButtonBuilder()
            .setCustomId(`modo_${modo}`)
            .setLabel(modo)
            .setStyle(ButtonStyle.Primary)
        )
      );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // ===== BOTÕES =====
  if (interaction.isButton()) {

  await interaction.deferUpdate(); // responde instantaneamente ao Discord

  const id = interaction.customId;

  // ===== ESCOLHER MODO =====
  if (id.startsWith("modo_")) {

    const modo = id.split("_")[1];

    const embed = new EmbedBuilder()
      .setTitle(`⚔️ Modo selecionado: ${modo}`)
      .setDescription("Agora escolha o valor:")
      .setColor("#57F287");

    const row = new ActionRowBuilder().addComponents(
      valores.map(valor =>
        new ButtonBuilder()
          .setCustomId(`valor_${modo}_${valor}`)
          .setLabel(`R$${valor}`)
          .setStyle(ButtonStyle.Success)
      )
    );

    return interaction.editReply({
      embeds: [embed],
      components: [row]
    });
  }

  // ===== ESCOLHER VALOR =====
  if (id.startsWith("valor_")) {

    const [, modo, valor] = id.split("_");
    const chave = `${modo}_${valor}`;

    if (!filas[chave]) filas[chave] = [];

    if (!filas[chave].includes(interaction.user.id)) {
      filas[chave].push(interaction.user.id);
    }

    const limite = modos[modo];

    const embed = new EmbedBuilder()
      .setTitle(`🔥 Fila ${modo} - R$${valor}`)
      .setDescription(
        `Jogadores: ${filas[chave].length}/${limite}\n\n` +
        filas[chave].map(id => `<@${id}>`).join("\n")
      )
      .setColor("#FEE75C");

    if (filas[chave].length >= limite) {

      const guild = interaction.guild;

      const canal = await guild.channels.create({
        name: `⚔️-${modo}-${valor}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          ...filas[chave].map(id => ({
            id,
            allow: [PermissionsBitField.Flags.ViewChannel]
          }))
        ]
      });

      await canal.send(
        `🔥 Partida formada!\nModo: ${modo}\nValor: R$${valor}\n\n${filas[chave].map(id => `<@${id}>`).join(" ")}`
      );

      filas[chave] = [];

      return interaction.editReply({
        content: `✅ Partida criada! Canal: ${canal}`,
        embeds: [],
        components: []
      });
    }

    return interaction.editReply({
      embeds: [embed],
      components: interaction.message.components
    });
  }
}