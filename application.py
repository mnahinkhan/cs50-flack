import os
import random

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

unique_id_counter = 0
server_side_memory = {'unique_id_counter': 0}


@app.route("/")
def index(**kwargs):
    default_options = {"logged_in": False}
    for k, v in kwargs.items():
        default_options[k] = v
    return render_template('index.html', **default_options)


@app.route("/get-messages", methods=["POST"])
def get_messages():
    print("blabla")
    channels = ["disease", 'red', 'zoos', 'tigers', 'food', 'travel', 'politics', 'Bellamy', 'contrive', 'Jill',
                'McKeon', 'voice', 'pilot', 'Elizabeth', 'paste', 'broom', 'Malaysia', 'abode', 'laconic', 'imbecile',
                'desiderata', 'quintessential', 'pray', 'ternary', 'lamprey', 'beep', 'mulct', 'directorate',
                'baptistery', 'jersey', 'Oberlin', 'clever', 'silicic', 'DC', 'pad', 'incommensurable', 'mutiny']

    messages = {}
    unique_id = request.form.get("unique_id")
    print(unique_id, 'uniqe id')
    for channel in channels:
        random_list = []
        selection_options = [{'sender': 'paul', 'unique_id': '0', 'message': 'Hey, what is up!', 'timestamp': '3:20pm'},
                             {'sender': 'jake', 'unique_id': '2', 'message': 'Nothing much man what about you paul?',
                              'timestamp': '4:20pm'},
                             {'sender': 'Nahin', 'unique_id': '1', 'message': 'Hey guys good to see ya!',
                              'timestamp': '5:20pm'}]
        for i in range(100):
            message_to_append = random.choice(selection_options)
            message_to_append['is_myself'] = message_to_append['unique_id'] == unique_id

            random_list.append(message_to_append)
        messages[channel] = random_list
    return jsonify(messages)


@app.route("/get-unique-id", methods=["POST"])
def get_unique_id():
    server_side_memory['unique_id_counter'] += 1
    return jsonify({'unique_id': server_side_memory['unique_id_counter']})

