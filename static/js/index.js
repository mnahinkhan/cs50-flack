document.addEventListener('DOMContentLoaded', () => {
    // localStorage.clear();
    // Functions to load pages
    document.querySelector('body').classList.add('enter_out');

    // document.querySelector('body').classList.add('enter_out');
    const logged_out = Handlebars.compile(document.querySelector('#logged_out').innerHTML);
    const logged_in = Handlebars.compile(document.querySelector('#logged_in').innerHTML);

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

    let channels;
    let messages;

    function load_logged_in_page(is_first_load) {

        const request = new XMLHttpRequest();
        request.open('POST', '/get-messages');
        // Callback function for when request completes
        request.onload = () => {
            // Extract JSON data from request
            const data = JSON.parse(request.responseText);
            console.log(data);
            // Update the result div
            messages = data;
            channels = Object.keys(messages);

            const active_channel = 'Malaysia';
            const delay = load_page(logged_in, is_first_load, {'display_name': 'Nahin', 'channels': channels});
            setTimeout( () => {

                update_messages(active_channel);

                document.querySelectorAll('.channel-name').forEach(channel_name_div => {
                    channel_name_div.onclick = () => {
                        const selection = channel_name_div.dataset.channel_name;
                        update_messages(selection);
                        document.querySelectorAll('.channel-name').forEach(channel_name_div =>
                                                            {channel_name_div.classList.remove('selected');});
                        channel_name_div.classList.add('selected');
                        return false;

                    };
                    if (channel_name_div.dataset.channel_name===active_channel) channel_name_div.onclick();
                });


            }, delay);

            };

        // Add data to send with request
        const data = new FormData();
        data.append('unique_id', localStorage.getItem('unique_id'));

        // Send request
        request.send(data);


    }

    function update_messages(channel_selection) {
        //only call when logged in page is loaded!
        const messages_template_generator = Handlebars.compile(document.querySelector('#messages_template').innerHTML);
        document.querySelector('#message-template-insertion-zone').innerHTML =
            messages_template_generator({'messages': messages[channel_selection]});

    }


    // Check if display name was previously selected by this user. Then load the correct page.
    if (!localStorage.getItem('display_name') || !localStorage.getItem('unique_id')) {
        load_logged_out_page();

    }
    else {
        load_logged_in_page(true);


    }












});
