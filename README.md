# Space Duel

**Space Duel** è un gioco 2D per due giocatori sviluppato in JavaScript utilizzando l’elemento HTML5 `<canvas>`.  
L’obiettivo è ridurre a zero i punti vita dell’avversario sparando proiettili e raccogliendo potenziamenti.

---

## Meccaniche di gioco

- Ogni giocatore controlla un’astronave posizionata nella propria metà dello schermo.
- Le due metà sono separate da una linea verticale centrale che non può essere oltrepassata.
- Ogni giocatore ha **100 HP** iniziali.
- Ogni colpo andato a segno infligge **10 danni**.
- Alla fine della partita viene mostrato il vincitore; premendo **R** si riavvia il gioco.

---

## Controlli

### Giocatore 1 (Rosso)
- Movimento: **W, A, S, D**
- Sparo: **F**

### Giocatore 2 (Blu/Ciano)
- Movimento: **I, J, K, L** (oppure frecce direzionali)
- Sparo: **Ò**

---

## Power-up

Ogni 5 secondi viene generato casualmente un potenziamento in una delle due metà del campo:

- **Cura**: +20 HP (fino a un massimo di 100)
- **Bomba**: −10/20 HP
- **Proiettili veloci**: aumenta temporaneamente la velocità dei colpi (5 secondi)

Gli effetti attivi sono visibili sopra l’astronave del giocatore.

---

## Aspetti tecnici principali

- Rendering tramite **Canvas 2D API**
- Gestione input tramite eventi `keydown` e `keyup`
- Loop di gioco basato su `requestAnimationFrame`
- Collision detection tramite distanza euclidea
- Sistema di effetti temporanei con `setTimeout`

---

## Condizione di vittoria

Vince il giocatore che per primo porta i punti vita dell’avversario a **0 HP**.