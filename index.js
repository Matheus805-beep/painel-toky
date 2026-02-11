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
  console.log(`✅ ORG TK online como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {

  // ===== COMANDO /painel =====
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "painel") {

      const embed = new EmbedBuilder()
        .setAuthor({ name: "ORG TK • Sistema de Filas" })
        .setTitle("🎮 Painel Oficial de Partidas")
        .setDescription(
          "Bem-vindo ao sistema de filas da **ORG TK**.\n\n" +
          "📌 **Como funciona?**\n" +
          "1️⃣ Escolha o modo (1v1, 2v2, 3v3 ou 4v4)\n" +
          "2️⃣ Selecione o valor da partida\n" +
          "3️⃣ Entre na fila e aguarde completar\n\n" +
          "⚡ Simples, rápido e automático."
        )
        .setColor("#0099ff")
        .setFooter({ text: "ORG TK © Sistema Oficial" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("modo_1v1").setLabel("🔥 1v1").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("modo_2v2").setLabel("⚔ 2v2").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("modo_3v3").setLabel("💥 3v3").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("modo_4v4").setLabel("👑 4v4").setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // ===== BOTÕES =====
  if (interaction.isButton()) {

    // ESCOLHA DO MODO
    if (interaction.customId.startsWith("modo_")) {

      const modo = interaction.customId.replace("modo_", "");

      const embed = new EmbedBuilder()
        .setAuthor({ name: "ORG TK • Seleção de Valor" })
        .setTitle(`💰 Modo ${modo.toUpperCase()}`)
        .setDescription(
          "Selecione abaixo o valor da partida.\n\n" +
          "💎 Escolha com atenção antes de continuar."
        )
        .setColor("#00c3ff")
        .setFooter({ text: "ORG TK © Partidas Ranqueadas" });

      const valores = [1, 5, 10, 20, 50, 100];
      const row = new ActionRowBuilder();

      valores.forEach(valor => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`valor_${modo}_${valor}`)
            .setLabel(`💲 ${valor}`)
            .setStyle(ButtonStyle.Secondary)
        );
      });

      await interaction.update({
        embeds: [embed],
        components: [row]
      });
    }

    // ESCOLHA DO VALOR
    if (interaction.customId.startsWith("valor_")) {

      const partes = interaction.customId.split("_");
      const modo = partes[1];
      const valor = partes[2];

      const embed = new EmbedBuilder()
        .setAuthor({ name: "ORG TK • Fila Criada" })
        .setTitle("🎮 Partida Configurada com Sucesso")
        .setDescription(
          `🏆 **Modo:** ${modo.toUpperCase()}\n` +
          `💰 **Valor:** ${valor}\n\n` +
          "Clique no botão abaixo para entrar na fila.\n" +
          "A partida começará quando estiver completa."
        )
        .setColor("#007bff")
        .setFooter({ text: "ORG TK © Sistema Automático" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`entrar_${modo}_${valor}`)
          .setLabel("✅ Entrar na Fila")
          .setStyle(ButtonStyle.Success)
      );

      await interaction.update({
        embeds: [embed],
        components: [row]
      });
    }

    // ENTRAR NA FILA
    if (interaction.customId.startsWith("entrar_")) {

      await interaction.reply({
        content: "✅ Você entrou na fila com sucesso! Aguarde completar.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);