# MyCityMySoundsConcertEdition
This is a modification of the MyCity, MySounds project website and mobile app to include the audience in an interactive multichannel sound-map concert.

*	NodeJS Installation
	(For the concert you need to set up a NodeJS Web-Socket Client which listens to the interaction on the Web-Socket Server. When a sound file is being played it forwards the message as osc in the local area network.)

	-> go to https://nodejs.org
	-> hit "Install", download and install the package
	-> after the installation open a terminal and type "sudo npm install socket.io-client", you may have to enter the password of your mac login
	-> now install node-osc with "sudo npm install node-osc"

*	Max MSP Sound Player Installation and Configuration
	
	-> make sure you have the Max 6 Runtime installed (https://cycling74.com/downloads/runtime/)
	-> go to the subfolder "maxmsp_msmk" of the "MyCityMySoundsConcertEdition" directory
	-> copy here all the sound files you are going to use in the concert (make sure they have the correct extension .wav and their names are equal to the ones you uploaded to the MyCity, MySounds database. once you fire a sound on the concert website its extension is exchanged from mp3 to wav and the sound gets played by the max patch)
	-> open a terminal and cd to the "maxmsp_msmk" folder
	-> enter "ls *wav | ./script_list_soundfiles.sh > msmk_filenames.txt" 
	-> now you can run the patch "_msmk_main.maxpat" in the runtime

*	Configuration

	-> there is a file called "config.json" in the folder, open it with a text editor
	-> modify this file according your network. Replace the correct ip address with the one from your computer where the max patch is running (this one is the OSC Server) 

*	NodeJS - Local Socket Client start

	-> open a terminal
	-> cd to the directory where the "local_socket_client.js" file is located
	-> type "node local_socket_client.js" 

*	Open the concert web site

	-> make sure your NodeJS client is running and open a (mobile-) web browser
	-> Once the Web site is open you are asked to enter a user name
	-> you can enter any kind of nick name that should be displayed when you enter a sound
	-> so this web site should also be opened by everyone in the audience who wants to take part in the interactive concert
	-> there is one secret name though that is used by the front projection that is visible to everyone in the audience and should be set up for those who don't have a mobile device and just want to follow the interaction. this name is "ima_beamer" and the map content is displayed a bit different from the others.. the sound categories are shown as well as the map centers each sound event automatically

*	Open the conductor remote

	-> this is only for the conductor who controls which categories are highlighted at certain points in time.
	-> in a separate (mobile-) browser window type the previously mentioned address but instead of "concert" type "conductor_remote"
	-> once you click on a certain cetegory the respective markers are shown on the map	

*	Trouble Shooting

	-> make sure each computer and device is in the same LAN and has access to the internet
	-> make sure the ports you are using are actually allowed in the network.. better talk to your sys-admin to be sure

	