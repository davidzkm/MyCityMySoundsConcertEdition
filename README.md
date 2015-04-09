# MyCityMySoundsConcertEdition
This is a modification of the MyCity, MySounds project website and mobile app to include the audience in an interactive multichannel sound-map concert.

*	NodeJS Installation
	(For the concert you need to set up a NodeJS Socket Server which handles all the interactive events and a HTTP Server which hosts the websites)

	-> go to https://nodejs.org
	-> hit "Install", download and install the package
	-> after the installation open a terminal and type "sudo npm install socket.io", you may have to enter the password of your mac login
	-> now install node-osc with "sudo npm install node-osc"
	-> also install the NodeJS http mini-server with "sudo npm install http-server -g"

*	Configuration

	-> there is a file called "config.json" in the "public_html" directory which both the Socket Server and the Web Sites use
	-> modify this file according your network, replace the correct ip addresses with the ones from your computer where the max patch is running (this one is the OSC Server) and the computer which is hosting the NodeJS servers

*	NodeJS HTTP Server start

	-> open a terminal
	-> cd to the "public_html" directory and enter "http-server -a (here place the ip of your mac) -p (here place the desired port, default is 8080 if you leave the option)"
	-> so an example would be http-server -a 192.168.230.97 -p 8080

*	NodeJS Socket Server start

	-> open a terminal
	-> cd to the directory where the "app.js" file is located
	-> type "node app.js" 

*	Open the concert web site

	-> make sure your NodeJS servers are running and open a (mobile-) web browser
	-> type "http://(ip of where you launched your http server)/(port of where you launched your http server)" for instance "http://192.168.230.97:8080/concert"
	-> there is an automatic forwarding to the concert website so you might also just type "http://192.168.230.97:8080"
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

	