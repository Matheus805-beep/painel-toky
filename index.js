const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "painel") {

      const embed = new EmbedBuilder()
        .setTitle("🎮 PAINEL TOKY")
        .setDescription("Escolha o modo abaixo:")
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("x1")
          .setLabel("1v1")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("x2")
          .setLabel("2v2")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("x3")
          .setLabel("3v3")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("x4")
          .setLabel("4v4")
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  if (interaction.isButton()) {
    await interaction.reply({
      content: `Você escolheu ${interaction.customId.toUpperCase()} 🔥`,
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);