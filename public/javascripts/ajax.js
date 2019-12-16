$(document).ready ( function() {
    $("#pills-update-tab").click(function(){
        $("#contactsTable").find("tr:gt(0)").remove();
        jQuery.get( "contacts", function( contacts ) {
            $.each(contacts, function (index, contact) {
                $('#contactsTable').append('<tr class="bg-secondary">' +
                    '<td>' + contact._id + '</td>' +
                    '<td>' + contact.fname + '</td>' +
                    '<td>' + contact.lname + '</td>' +
                    '<td>' + contact.street + '</td>' +
                    '<td>' + contact.city + '</td>' +
                    '<td>' + contact.state + '</td>' +
                    '<td>' + contact.zip + '</td>' +
                    '<td>' + contact.phone + '</td>' +
                    '<td>' + contact.email + '</td>' +
                    '<td>' + contact.salutation + '</td>' +
                    '<td>' + contact.contactByMail + '</td>' +
                    '<td>' + contact.contactByPhone + '</td>' +
                    '<td>' + contact.contactByEmail + '</td>' +
                    '<td>' + contact.latitude + '</td>' +
                    '<td>' + contact.longitude + '</td>' +
                    '<td><button type="button" class="btn btn-secondary" id="editButton" data-toggle="modal" data-target="#editModal"><i class="fa fa-edit"></i></button>' +
                    '&nbsp&nbsp&nbsp<button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#mapModal" id="showMapButton"><i class="fa fa-map-marker"></i></button>' +
                    '&nbsp&nbsp&nbsp<button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#deleteModal" id="deleteContactButton"><i class="fa fa-trash"></i></button></td>' +
                    '</tr>')
            });
        });
    });

    //Initializing the map first
    var map = L.map('map');

    //If the show map button is clicked in the table
    $('#contactsTable').on('click', '#showMapButton', function(e) {

        //Getting the latitude and longitude from the table cell
        var latitude = $(this).closest('tr').find("td:nth-child(14)").text();
        var longitude = $(this).closest('tr').find("td:nth-child(15)").text();
        var fname = $(this).closest('tr').find("td:nth-child(2)").text();
        var lname = $(this).closest('tr').find("td:nth-child(3)").text();
        var address = $(this).closest('tr').find("td:nth-child(4)").text() + ', ' + $(this).closest('tr').find("td:nth-child(5)").text() + ', ' + $(this).closest('tr').find("td:nth-child(6)").text() + ', ' +$(this).closest('tr').find("td:nth-child(7)").text();

        //Setting the map view
        map.setView([latitude, longitude], 13);

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            accessToken: 'pk.eyJ1IjoiYWJoYW5kYXIiLCJhIjoiY2szZXM1bXU5MDFneTNicnQ0cmhzMm9iNiJ9.Cuwny5L3BlINNFh2Z62izw'
        }).addTo(map);

        var marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup("<b>" + fname + " " + lname + "</b><br>"+ address);
        marker.on('mouseover', function (e) {
            this.openPopup();
        });

        marker.on('click', function (e) {
            this.openPopup();
        });

        setTimeout(function(){ map.invalidateSize()}, 500);
    });

    //If the delete contact button is pressed
    $('#contactsTable').on('click', '#deleteContactButton', function(e) {
        $('#deletionConfirmation').text($(this).closest('tr').find("td:nth-child(2)").text() + " " + $(this).closest('tr').find("td:nth-child(3)").text());
        $('#mongoID').text($(this).closest('tr').find("td:nth-child(1)").text());
        $('#mongoID').hide();
    });

    //If the delete confirmation button is pressed
    $('#deleteConfirmationButton').click(function() {
        idToRemove = $('#mongoID').text();
        $.post("delete", {id:idToRemove},
            function(data, status){
                if(status == 'success') {
                    $('#jumbotronHeading').text("Deletion successful.");
                    $('#jumbotronDesc').text("");
                    $('#pills-update-tab').trigger('click');
                }
                else {
                    $('#jumbotronHeading').text("404");
                    $('#jumbotronDesc').text("The record could not be deleted.");
                }
            });
    });

    //If the delete contact button is pressed
    $('#contactsTable').on('click', '#editButton', function(e) {
        $('#contactID').val($(this).closest('tr').find("td:nth-child(1)").text());
        $('#up_fname').val($(this).closest('tr').find("td:nth-child(2)").text());
        $('#up_lname').val($(this).closest('tr').find("td:nth-child(3)").text());
        $('#up_street').val($(this).closest('tr').find("td:nth-child(4)").text());
        $('#up_city').val($(this).closest('tr').find("td:nth-child(5)").text());
        $('#up_state').val($(this).closest('tr').find("td:nth-child(6)").text());
        $('#up_zip').val($(this).closest('tr').find("td:nth-child(7)").text());
        $('#up_phond').val($(this).closest('tr').find("td:nth-child(8)").text());
        $('#up_email').val($(this).closest('tr').find("td:nth-child(9)").text());
        if($(this).closest('tr').find("td:nth-child(10)").text() == 'Mr.') {
            $('#up_radio1').prop("checked", true);
        }
        else if($(this).closest('tr').find("td:nth-child(10)").text() == 'Mrs.') {
            $('#up_radio2').prop("checked", true);
        }
        else if($(this).closest('tr').find("td:nth-child(10)").text() == 'Ms.') {
            $('#up_radio3').prop("checked", true);
        }
        else if($(this).closest('tr').find("td:nth-child(10)").text() == 'Dr.') {
            $('#up_radio4').prop("checked", true);
        }
        if($(this).closest('tr').find("td:nth-child(11)").text() == 'true') {
            $('#up_contactByMail').prop("checked", true);
        }
        if($(this).closest('tr').find("td:nth-child(12)").text() == 'true') {
            $('#up_contactByPhone').prop("checked", true);
        }
        if($(this).closest('tr').find("td:nth-child(13)").text() == 'true') {
            $('#up_contactByEmail').prop("checked", true);
        }
    });

    //If the update button is pressed
    $('#updateButton').click(function() {
        $.ajax({
            type: 'POST',
            url: 'update',
            data: $('#updateForm').serialize(),
            success: function(data) {
                $('#jumbotronHeading').text("Update successful.");
                $('#jumbotronDesc').text(data + "'s records has been updated.");
                $('#pills-update-tab').trigger('click');
                $('#editModal').modal('toggle');
            }
        })
    });

    //If the create button is pressed
    $('#createButton').click(function() {
        $.ajax({
            type: 'POST',
            url: 'mailer',
            data: $('#createForm').serialize(),
            success: function(data) {
                $('#jumbotronHeading').text("Creation successful.");
                $('#jumbotronDesc').text(data + "'s record has been added.");
            }
        })
    });

    //If the login button is pressed
    $('#loginButton').click(function() {
        $.ajax({
            type: 'POST',
            url: 'login',
            data: $('#loginForm').serialize(),
            success: function(data) {
                if(data=="success") {
                    $('#iLocateJumbotron').removeClass();
                    $('#iLocateJumbotron').addClass("jumbotron jumbotron-fluid bg-success");
                    $('#jumbotronHeading').text("iLocate");
                    $('#jumbotronDesc').text("Login successful. You can now begin updating contacts.");
                }
            },
            error: function() {
                $('#iLocateJumbotron').removeClass();
                $('#iLocateJumbotron').addClass("jumbotron jumbotron-fluid bg-danger");
                $('#jumbotronHeading').text("iLocate");
                $('#jumbotronDesc').text("Login failed. Please try again.");
            }
        })
    });

    //If the login button is pressed
    $('#fsearchButton').click(function() {
        $.ajax({
            type: 'POST',
            url: 'fsearch',
            data: {query: $('#fsearchQuery').val()},
            success: function(data) {
                $("#contactsTable").find("tr:gt(0)").remove();
                $.each(data, function (index, contact) {
                    $('#contactsTable').append('<tr class="bg-secondary">' +
                        '<td>' + contact._id + '</td>' +
                        '<td>' + contact.fname + '</td>' +
                        '<td>' + contact.lname + '</td>' +
                        '<td>' + contact.street + '</td>' +
                        '<td>' + contact.city + '</td>' +
                        '<td>' + contact.state + '</td>' +
                        '<td>' + contact.zip + '</td>' +
                        '<td>' + contact.phone + '</td>' +
                        '<td>' + contact.email + '</td>' +
                        '<td>' + contact.salutation + '</td>' +
                        '<td>' + contact.contactByMail + '</td>' +
                        '<td>' + contact.contactByPhone + '</td>' +
                        '<td>' + contact.contactByEmail + '</td>' +
                        '<td>' + contact.latitude + '</td>' +
                        '<td>' + contact.longitude + '</td>' +
                        '<td><button type="button" class="btn btn-secondary" id="editButton" data-toggle="modal" data-target="#editModal"><i class="fa fa-edit"></i></button>' +
                        '&nbsp&nbsp&nbsp<button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#mapModal" id="showMapButton"><i class="fa fa-map-marker"></i></button>' +
                        '&nbsp&nbsp&nbsp<button type="button" class="btn btn-secondary" data-toggle="modal" data-target="#deleteModal" id="deleteContactButton"><i class="fa fa-trash"></i></button></td>' +
                        '</tr>')
                });
            }
        })
    });
});

