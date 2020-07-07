# Project 2 - Flack - A single page Web App

For CS50 - Web Programming with Python and JavaScript course

This project is a Flask-based website that allows users to chat about various topics using "channels".

It has logic for both the server-side and the client side: the users of the website communicate with the server
whenever they type messages, upon which the server broadcasts the new message to all the users, so that all the users
are in sync with respect to the messages. SocketIO is used for this purpose. Users also have the option to create
channels, which is also kept in sync using a similar strategy described for the messages above.

static/css/styles.scss describes the style of the page in SCSS format.

static/js/index.js has the logic for the client side, like keeping the messages and channels up to date as described
above. It also helps with animating and creating various elements on the page for a smooth experience.

templates/index.html describes the layout of the web page. While much of it uses Bootstrap to divide the page nicely
into sections, it also includes template sections in Handlebars that is made of by index.html to customize the looks of
the page (updating messages and channels mainly).

Finally, application.py has the server side logic, mainly responsible for broadcasting new channels and messages
reported by users, but also to store all the messages for each of the channels (up to a specified limit) so that any
client could get the messages shared so far on each channel whenever they wished.

To run this web app, download the files and type "flask run" on the terminal, then go to the URL specified on the
terminal.

There are three main additional features that I have implemented for this project beyond the requirements of the course:
1. Separating messages into those that are sent by "self" and those that are sent by "others", by placing them on
different sides of the chat window
2. Maintaining a sorted order of chat names in the chat list alphabetically, including live insertion at the correct
place to maintain sorted order upon broadcast of channel creation from server
3. Allowing multiple users to have the same display name but still maintain distinctness among them, through
registration of unique id's for clients upon request to the server. This way, two users with the same display name can 
 communicate while knowing which messages are theirs and which ones are the others'. 

