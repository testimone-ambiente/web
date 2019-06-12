
# Testimoni ambiente web
Sito web che si occupa di visualizzare le segnalazioni fatte dagli utenti tramite un pannello di controllo e di esporre pubblicamente una RestAPI per permettere all'applicazione mobile di interagire col backend.<br>
<i> Sviluppato da Emiliano Maccaferri (backend) ed Erald Xholi (frontend), in collaborazione con Mattia Gualtieri e Yari Salsi (app)</i>

# Premessa
Ci è stato introdotto un progetto portato avanti da Mountain Wilderness che aveva come obiettivo principale la tutela dell'ambiente nel quale questa organizzazione lavora.<br>
Tale obiettivo è stato soddisfatto mediante la creazione di un sistema che permettesse la segnalazione di eventi ambientali sui quali Mountain Wilderness potesse intervenire per poterli poi risolvere, come ad esempio la presenza di una discarica abusiva in una determinata zona, la presenza di feste non autorizzate, etc, etc...
<br>
Nel sistema ci sono, dunque, due principali entità:
- <b>L'applicazione mobile</b>: da qui l'utente può segnalare qualsiasi tipo di evento, aggiungendo foto, la propria posizione, una descrizione del problema e decidere se fare la segnalazione anonimamente o meno.
- <b> Il sito web</b>: da qui l'utente potrà constatare se la propria segnalazione è andata a buon fine e può seguirne l'avanzamento (in caso venisse presa in carico). È stato sviluppato un apposito pannello di controllo per chi lavora in Mountain Wilderness per poter visualizzare, classificare e rispondere a tutte le segnalazioni ricevute.
# Aspetti tecnici e funzionamento 
Il backend è stato realizzato con [Node.js](https://nodejs.org) ed [Express.js](https://expressjs.com), mentre come DBMS è stato utilizzato [MySQL](https://www.mysql.com).
Il frontend è stato realizzato utilizzando [jQuery](https://jquery.com/), HTML5 e [Leaflet](https://leafletjs.com/) per l'elaborazione delle mappe.<br>
Per una lista delle librerie open source utilizzate [fare click qui](https://github.com/testimone-ambiente/web/blob/master/dep.txt)
## Funzionamento
L'utente ha due strade da scegliere quando si tratta di eseguire una segnalazione:
1. Segnalazione anonima
2. Segnalazione non anonima

### 1) Segnalazione anonima
L'utente eseguirà la segnalazione senza le sue generalità, pertanto queste ultime non saranno memorizzate dal nostro sistema. La segnalazione anonima avrà <i>peso minore</i> rispetto al secondo tipo, poiché l'identità del segnalatore non è verificata, ergo non si è sicuri che possa essere una segnalazione veritiera.

### 2) Segnalazione non anonima
Per poter eseguire una segnalazione con <i>maggior peso</i> sarà necessario eseguire la registrazione.<br>
L'utente potrà creare il proprio account dall'applicazione mobile e successivamente verificare il proprio indirizzo email (passo <b>necessario</b> per poter utilizzare il proprio account).<br>
La protezione degli account è conforme alle norme GDPR, pertanto tutti i dati sensibili sono criptati con crittografia AES-256-CBC.

Nonostante questa differenziazione delle tipologie di segnalazioni i dati raccolti (non sensibili) sono gli stessi, pertanto verrà richiesto accesso al GPS per poter ottenere la posizione dell'utente, verrà chiesta una breve descrizione del problema e un titolo da dare alla segnalazione.<br>
Sarà inoltre possibile aggiungere foto per migliorare l'efficacia della propria segnalazione.<br><br>
## Struttura delle richieste
La segnalazione verrà effettuata con una chiamata `POST` a uno dei seguenti endpoint:
- `/api/data/addReport`: permette di aggiungere una segnalazione con posizione da un account verificato.
- `/api/data/addGenericReport`: permette di aggiungere una segnalazione senza posizione da un account verificato, utile quando non si ha una posizione precisa dell'evento e si preferisce scrivere a mano il luogo.
- `/api/data/addGuestReport` e `/api/data/addGenericGuestReport`: hanno lo stesso funzionamento delle succitate, ma per segnalazioni anonime.

### Struttura di `addReport` e `addGuestReport`:
* (float) `longitude`:  rappresenta la longitudine del dispositivo che sta effettuando la segnalazione. <b>Obbligatorio</b> 
* (float) `latitude`: rappresenta la latitudine del dispositivo che sta effettuando la segnalazione. <b>Obbligatorio</b>
* (string) `title`: titolo della segnalazione. <b>Obbligatorio</b>
* (float) `height`: altezza alla quale si trova il dispositivo quando viene effettuata la segnalazione.  <i>Opzionale</i>
* (string) `sessionid`: viene inviato in caso la segnalazione non sia anonima e rappresenta l'identificativo di sessione dell'utente segnalante. <i> Opzionale </i>
* (string) `report_region`: regione nella quale si trova l'utente segnalante. <b>Obbligatorio</b>
* (string) `report_description`: descrizione del problema. <i> Opzionale </i>
* (string) `report_address`: indirizzo. <i>Opzionale</i>
* (string[]) `images`: stringa CSV che contiene le immagini scattate rappresentate in `base64` e compresse con `gzip`. <i>Opzionale</i>
### Struttura di `addGenericReport` e `addGenericGuestReport`:
È da ricordare che in questo genere di segnalazioni la posizione non è precisa e si vuole principalmente segnalare un evento futuro.
* (string) `title`: titolo della segnalazione. <b>Obbligatorio</b>
* (string) `sessionid`: viene inviato in caso la segnalazione non sia anonima e rappresenta l'identificativo di sessione dell'utente segnalante. <i> Opzionale </i>
* (string) `report_region`: regione nella quale si trova l'utente segnalante. <b>Obbligatorio</b>
* (string) `report_description`: descrizione del problema. <i> Opzionale </i>
* (string) `report_address`: indirizzo. <i>Opzionale</i>
* (string[]) `images`: stringa CSV che contiene le immagini scattate rappresentate in `base64` e compresse con `gzip`. <i>Opzionale</i>

# Il pannello di controllo
Nella homepage sarà possibile trovare un sommario di tutto quello che serve sapere riguardante le segnalazioni.
![
](https://cdn.emilianomaccaferri.com/dash.png)

### Scheda segnalazioni
Nella scheda delle segnalazioni si troverà immediatamente le ultime 10 segnalazioni effettuate (aggiornate in tempo reale).
<br>
Si potrà navigare anche fra l'archivio di tutte quante le segnalazioni effettuate
![
](https://cdn.emilianomaccaferri.com/s.png)

### Segnalazione in dettaglio
Da qui si potranno vedere tutte le informazioni riguardanti una segnalazione. <br>
È importante notare che la segnalazione completa sarà visibile <b>soltanto agli operatori di Mountain Wilderness</b> e non sarà mai completamente pubblica.<br>
L'unica informazione di dominio pubblico è la posizione della segnalazione, visibile dalla [mappa in tempo reale](https://ambiente.emilianomaccaferri.com/map).
![
](https://cdn.emilianomaccaferri.com/dett.png)

### Scheda impostazioni
Da questa scheda si potranno modificare le impostazioni del proprio account e anche di altri (se si hanno i permessi di modifica globali)
![
](https://cdn.emilianomaccaferri.com/sett.png)
