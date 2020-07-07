import os
import random
from bisect import bisect

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

unique_id_counter = 0
server_side_memory = {'unique_id_counter': 0}

max_no_of_messages = 100

channels = ["food", 'programming', 'parenting', 'tigers', 'travel', 'politics', 'gaming', 'cars', 'work', 'cooking',
            'history']
messages = {}
for each_channel in channels:
    messages[each_channel] = []

channels = sorted(list(messages.keys()), key=str.lower)


@app.route("/")
def index(**kwargs):
    return render_template('index.html')


@app.route("/get-messages", methods=["POST"])
def get_messages():
    unique_id = request.form.get("unique_id")
    channel_requested = request.form.get("channel")
    list_of_messages = messages[channel_requested]
    for message in list_of_messages:
        message['is_myself'] = int(message['unique_id']) == int(unique_id)
    return jsonify(list_of_messages)


@app.route("/get-channels", methods=["POST"])
def get_channels():
    return jsonify(channels)


@app.route("/get-unique-id", methods=["POST"])
def get_unique_id():
    server_side_memory['unique_id_counter'] += 1
    return jsonify({'unique_id': server_side_memory['unique_id_counter']})


@socketio.on("new message")
def new_message_broadcast(data):
    data['timestamp'] = data['timestamp'].replace(' ', '').lower()
    channel = data['channel']
    new_message = {k: v for k, v in data.items() if k != "channel"}
    messages[channel].append(new_message)
    messages[channel] = messages[channel][-max_no_of_messages:]
    data['max_no_of_messages'] = max_no_of_messages
    emit("message update", data, broadcast=True)


@socketio.on("new channel")
def new_channel(data):
    new_channel_name = data['new_channel_name']
    assert(new_channel_name not in messages)
    messages[new_channel_name] = []
    insertion_point = bisect(channels, new_channel_name)
    channels.insert(insertion_point, new_channel_name)
    data['insert_after'] = channels[insertion_point - 1] if insertion_point > 0 else -1
    emit("new channel created", data, broadcast=True)

