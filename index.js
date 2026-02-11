const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Enviar painel de fila')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registrando comandos...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Comandos registrados com sucesso!');
  } catch (error) {
    console.error(error);
  }
})();const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType,
  PermissionsBitField 
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;

const filas = {};

const modos = {
  "1v1": 2,
  "2v2": 4,
  "3v3": 6,
  "4v4": 8
};

const valores = [1, 5, 10, 20, 50, 100];

client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  // Comando /painel
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "painel") {

      const rowModos = new ActionRowBuilder().addComponents(
        Object.keys(modos).map(modo =>
          new ButtonBuilder()
            .setCustomId(`modo_${modo}`)
            .setLabel(modo)
            .setStyle(ButtonStyle.Primary)
        )
      );

      return interaction.reply({
        content: "Escolha o modo:",
        components: [rowModos]
      });
    }
  }

  // Botões
  if (interaction.isButton()) {
    const id = interaction.customId;

    if (id.startsWith("modo_")) {
      const modo = id.split("_")[1];

      const rowValores = new ActionRowBuilder().addComponents(
        valores.map(valor =>
          new ButtonBuilder()
            .setCustomId(`valor_${modo}_${valor}`)
            .setLabel(`${valor}`)
            .setStyle(ButtonStyle.Success)
        )
      );

      return interaction.update({
        content: `Modo selecionado: ${modo}\nEscolha o valor:`,
        components: [rowValores]
      });
    }

    if (id.startsWith("valor_")) {
      const [, modo, valor] = id.split("_");

      const chave = `${modo}_${valor}`;

      if (!filas[chave]) filas[chave] = [];

      if (filas[chave].includes(interaction.user.id)) {
        return interaction.reply({ content: "Você já está nessa fila!", ephemeral: true });
      }

      filas[chave].push(interaction.user.id);

      const limite = modos[modo];

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

        await canal.send(`🔥 Partida formada!\nModo: ${modo}\nValor: ${valor}\nJogadores: ${filas[chave].map(id => `<@${id}>`).join(", ")}`);

        filas[chave] = [];

        return interaction.update({
          content: `🔥 Partida formada para ${modo} - ${valor}!`,
          components: []
        });
      }

      return interaction.update({
        content: `Fila ${modo} - ${valor}\nJogadores: ${filas[chave].length}/${limite}`,
        components: interaction.message.components
      });
    }
  }
});

client.login(TOKEN);