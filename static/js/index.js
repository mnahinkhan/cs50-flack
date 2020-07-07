document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('body').classList.add('enter_out');


    const logged_out = Handlebars.compile(document.querySelector('#logged_out').innerHTML);
    const logged_in = Handlebars.compile(document.querySelector('#logged_in').innerHTML);
    Handlebars.registerPartial('each_channel_partial', document.querySelector('#each_channel_partial_template').innerHTML);
    function load_page(selector_reference, is_first_load, ...args) {
        let x,y,z;
        if (is_first_load) {
            x = 0;
            y = 0;
            z = 0;

        }
        else {
            x = 0;
            y = 1000;
            z = 1000;

        }

            setTimeout( () => {document.querySelector('body').classList.remove('enter_element');}, x);
            setTimeout( () => {document.querySelector("body").innerHTML = selector_reference(...args);}, y);
            setTimeout( () => {document.querySelector('body').classList.add('enter_element');}, z);
        return x+y+z

        }

    function load_logged_out_page() {
        const delay = load_page(logged_out, true);
        setTimeout( () => {
                                    const request = new XMLHttpRequest();
                                    request.open('POST', '/get-unique-id');
                                    // Callback function for when request completes
                                    request.onload = () => {

                                        // Extract JSON data from request
                                        const data = JSON.parse(request.responseText);
                                        localStorage.setItem('unique_id', data['unique_id'])};

                                    request.send();


                                    document.querySelector('#register_form').onsubmit = () => {
                                            localStorage.setItem('display_name', document.querySelector('#display_name_field').value);
                                            load_logged_in_page(false);
                                            return false;
                                         };
                                    // By default, submit button is disabled
                                    document.querySelector('#register_button').classList.add('fade_element');
                                    document.querySelector('#register_button').classList.add('fade_out');

                                    // Enable button only if there is text in the input field
                                    document.querySelector('#display_name_field').onkeyup = () => {
                                        if (document.querySelector('#display_name_field').value.length > 0) {
                                            document.querySelector('#register_button').classList.remove('fade_out');
                                        }

                                        else {
                                            document.querySelector('#register_button').classList.add('fade_out');
                                        }

                                    };

        }, delay);

    }

    let active_channel;
    let messages;

    function channel_name_onclick(channel_name_div) {
        active_channel = channel_name_div.dataset.channel_name;
        localStorage.setItem('active_channel', active_channel);
        update_messages(active_channel);
        document.querySelectorAll('.channel-name').forEach(channel_name_div => {
            channel_name_div.classList.remove('selected');
        });
        channel_name_div.classList.add('selected');
        return false;

    }
    function load_logged_in_page(is_first_load) {
        // const channels = get_channels();
        get_channels( channels => {
        const delay = load_page(logged_in, is_first_load, {'display_name': localStorage.getItem('display_name')});
        setTimeout( () => {
            channels_loader(channels);
            if (localStorage.getItem('active_channel')) {
                active_channel = localStorage.getItem('active_channel');
            }
            else if (channels.length > 0){
                active_channel = channels[0]
            }

            update_messages(active_channel);

            document.querySelectorAll('.channel-name').forEach(channel_name_div => {
                channel_name_div.onclick = () => channel_name_onclick(channel_name_div);
                if (channel_name_div.dataset.channel_name===active_channel) channel_name_div.onclick();
            });

            // Connect to websocket
            const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

            // When connected, configure buttons
            socket.on('connect', () => {

                // Each button should emit a "submit vote" event
                document.querySelector('#message-send-form').onsubmit = () => {
                        const message_text = document.querySelector('#message-input-area').value;
                        if (message_text.length > 0) {
                            const dateWithoutSecond = new Date();
                            const time_string = dateWithoutSecond.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
                            socket.emit('new message', {'unique_id': localStorage.getItem('unique_id'),
                                'sender': localStorage.getItem('display_name'),
                                'message': message_text, 'timestamp': time_string, 'channel': active_channel});
                            document.querySelector('#message-input-area').value = '';
                        }
                        return false;
                    };

                document.querySelector('#new-channel-form').onsubmit = () => {
                    const new_channel_name = document.querySelector('#new-channel-input').value;
                    document.querySelector('#new-channel-input').value = '';
                    if (new_channel_name.length > 0) {
                        get_channels(current_channels => {
                            if (current_channels.indexOf(new_channel_name) > -1) {
                                //In the array!
                                document.querySelector(`[data-channel_name='${new_channel_name}']`).onclick()
                            } else {
                                //Not in the array
                                socket.emit('new channel', {'new_channel_name': new_channel_name})
                            }

                        });


                    }

                    return false;
                };
                });


            socket.on('message update', data => {
                if (data['channel'] === active_channel) {
                    const {channel, ...message} = data;
                    message['is_myself'] = parseInt(message['unique_id']) === parseInt(localStorage.getItem('unique_id'));
                    messages.push(message);
                    messages = messages.slice(-data['max_no_of_messages'], messages.length);
                    messages_loader(active_channel);
                }


            });

            socket.on('new channel created', data => {
                const new_channel_name = data['new_channel_name'];
                const one_channel_div_generator = Handlebars.compile(document.querySelector('#each_channel_partial_template').innerHTML);
                const one_channel_html = one_channel_div_generator({'channel_name': new_channel_name});
                const where_to_insert_after = data['insert_after'];
                if (where_to_insert_after === -1) {
                    //will come first
                    document.querySelector('#channels-template-insertion-zone').insertAdjacentHTML('afterbegin', one_channel_html)
                }
                else {
                    document.querySelector(`[data-channel_name=${where_to_insert_after}`).insertAdjacentHTML('afterend', one_channel_html);
                }
                const channel_name_div = document.querySelector(`[data-channel_name=${new_channel_name}`);
                channel_name_div.onclick = () => channel_name_onclick(channel_name_div);
                document.querySelector(`[data-channel_name='${new_channel_name}']`).onclick();
            });


        }, delay);

    });
    }

    function get_channels( next_action) {
        const request = new XMLHttpRequest();
        request.open('POST', '/get-channels');
        request.onload = () => {
            const channels = JSON.parse(request.responseText);
            next_action(channels);
        };
        request.send()
    }

    function update_messages(channel_selection) {
        const request = new XMLHttpRequest();
        request.open('POST', '/get-messages');
        // Callback function for when request completes
        request.onload = () => {
            messages = JSON.parse(request.responseText);
            messages_loader(channel_selection);
        };
        // Add data to send with request
        const data = new FormData();
        data.append('unique_id', localStorage.getItem('unique_id'));
        data.append('channel', channel_selection);

        // Send request
        request.send(data);

    }

    function messages_loader(channel_selection) {
        const messages_template_generator = Handlebars.compile(document.querySelector('#messages_template').innerHTML);
        document.querySelector('#message-template-insertion-zone').innerHTML =
            messages_template_generator({'messages': messages, 'channel_name': channel_selection});
        const objDiv = document.querySelector('div.messages-subsection');
        objDiv.scrollTo({top: objDiv.scrollHeight, behavior: 'smooth'});

    }

    function channels_loader(channels) {
        const channels_template_generator = Handlebars.compile(document.querySelector('#channels_template').innerHTML);
        document.querySelector('#channels-template-insertion-zone').innerHTML =
            channels_template_generator({'channels': channels});
    }

    // Check if display name was previously selected by this user. Then load the correct page.
    if (!localStorage.getItem('display_name') || !localStorage.getItem('unique_id')) {
        load_logged_out_page();

    }
    else {
        load_logged_in_page(true);


    }





});
