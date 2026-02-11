const { 
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
  intents: [GatewayIntentBits.Guilds]
});

const filas = {};

client.once("ready", () => {
  console.log(`✅ ORG TK online como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  try {

    // ===== COMANDO /painel =====
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "painel") {

        const embed = new EmbedBuilder()
          .setAuthor({ name: "ORG TK • Sistema Oficial" })
          .setTitle("🎮 Painel de Partidas")
          .setDescription("Escolha o modo para iniciar a fila.")
          .setColor("#0099ff");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("modo_1v1").setLabel("1v1").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_2v2").setLabel("2v2").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_3v3").setLabel("3v3").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_4v4").setLabel("4v4").setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
      }
    }

    // ===== BOTÕES =====
    if (interaction.isButton()) {

      // ESCOLHER MODO
      if (interaction.customId.startsWith("modo_")) {

        const modo = interaction.customId.replace("modo_", "");

        const embed = new EmbedBuilder()
          .setTitle(`💰 Modo ${modo.toUpperCase()}`)
          .setDescription("Escolha o valor da partida:")
          .setColor("Green");

        const valores = [1, 5, 10, 20, 50, 100];

        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();

        valores.forEach((valor, index) => {
          const botao = new ButtonBuilder()
            .setCustomId(`valor_${modo}_${valor}`)
            .setLabel(`${valor}`)
            .setStyle(ButtonStyle.Secondary);

          if (index < 5) row1.addComponents(botao);
          else row2.addComponents(botao);
        });

        await interaction.update({
          embeds: [embed],
          components: [row1, row2]
        });
      }

      // CRIAR FILA
      else if (interaction.customId.startsWith("valor_")) {

        const partes = interaction.customId.split("_");
        const modo = partes[1];
        const valor = partes[2];

        const maxJogadores = parseInt(modo[0]) * 2; // 1v1 = 2 jogadores
        const filaId = `${modo}_${valor}`;

        filas[filaId] = {
          modo,
          valor,
          jogadores: [],
          max: maxJogadores
        };

        const embed = new EmbedBuilder()
          .setTitle("🎮 Fila Criada")
          .setDescription(
            `Modo: ${modo.toUpperCase()}\n` +
            `Valor: ${valor}\n\n` +
            `Jogadores: 0/${maxJogadores}`
          )
          .setColor("Blue");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`entrar_${filaId}`)
            .setLabel("Entrar")
            .setStyle(ButtonStyle.Success)
        );

        await interaction.update({
          embeds: [embed],
          components: [row]
        });
      }

      // ENTRAR NA FILA
      else if (interaction.customId.startsWith("entrar_")) {

        const filaId = interaction.customId.replace("entrar_", "");
        const fila = filas[filaId];

        if (!fila.jogadores.includes(interaction.user.id)) {
          fila.jogadores.push(interaction.user.id);
        }

        // Atualiza embed
        const embed = new EmbedBuilder()
          .setTitle("🎮 Fila Atualizada")
          .setDescription(
            `Modo: ${fila.modo.toUpperCase()}\n` +
            `Valor: ${fila.valor}\n\n` +
            `Jogadores (${fila.jogadores.length}/${fila.max}):\n` +
            fila.jogadores.map(id => `<@${id}>`).join("\n")
          )
          .setColor("Blue");

        await interaction.update({
          embeds: [embed]
        });

        // SE COMPLETAR → CRIA CANAL
        if (fila.jogadores.length >= fila.max) {

          const canal = await interaction.guild.channels.create({
            name: `partida-${fila.modo}-${fila.valor}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
              },
              ...fila.jogadores.map(id => ({
                id: id,
                allow: [PermissionsBitField.Flags.ViewChannel]
              }))
            ]
          });

          await canal.send(
            `🔥 Partida iniciada!\nModo: ${fila.modo}\nValor: ${fila.valor}\n\nJogadores:\n` +
            fila.jogadores.map(id => `<@${id}>`).join("\n")
          );

          delete filas[filaId];
        }
      }
    }

  } catch (error) {
    console.error("ERRO DETECTADO:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Ocorreu um erro interno.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);