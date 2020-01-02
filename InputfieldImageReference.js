var InputfieldImageReference = {
    init: function () {
        var fields = document.querySelectorAll('.InputfieldImageReference');
        fields.forEach(field => {
            if (field.classList.contains('imagereference_initialised')) return;
            InputfieldImageReference.initPickFile(field);
        });
        InputfieldImageReference.initModalEditImages();
    },
    initPickFile: function (field) {
        if (!field.classList.contains('imagereference_initialised')) field.classList.add('imagereference_initialised');
        InputfieldImageReference.initGetThumbnails(field);
        InputfieldImageReference.initSelectAnyPage(field);
        var preview = field.querySelector('div.uk-panel img');
        var caption = field.querySelector('div.uk-panel .uk-thumbnail-caption');
        var remove = field.querySelector('div.uk-panel > span');
        var inputValue = field.querySelector('input.imagereference_value');

        remove.addEventListener('click', function (e) {
            preview.setAttribute('src', preview.getAttribute('data-src'));
            caption.innerHTML = '';
            inputValue.value = '';
        });
        $(field).on('click', '.uk-thumbnav img', function (e) {
            var file = this;
            var src = file.getAttribute('src');
            var fileinfo = file.getAttribute('uk-tooltip');
            var filename = file.getAttribute('data-filename');
            var pageid = file.getAttribute('data-pageid');
            preview.setAttribute('src', src);
            inputValue.value = JSON.stringify({ "pageid": pageid.toString(), "filename": filename });
            caption.innerHTML = fileinfo;
        });
    },
    initGetThumbnails: function (field) {
        $(field).on('click', '.imagereference_thumbholder:not(#imagereference_thumbs_anypage)', function (e) {
            if (e.target.closest('.uk-thumbnav')) return;
            var target = e.currentTarget;
            var thumbnav = target.querySelector('.uk-thumbnav');
            var pageid = thumbnav.getAttribute('data-pageid');
            var folderpath = thumbnav.getAttribute('data-folderpath');
            var imagesfields = thumbnav.getAttribute('data-imagesfields');
            var url = ProcessWire.config.InputfieldImageReference.url + '&pageid=' + pageid;
            if (folderpath) url = url + '&folderpath=' + folderpath;
            if (imagesfields) {
                var fields = JSON.parse(imagesfields);
                for (let index = 0; index < fields.length; index++) {
                    url = url + '&imagesfields[' + index + ']=' + fields[index];
                }
            }
            var closed = target.classList.contains('InputfieldStateCollapsed');
            var empty = thumbnav.querySelector('li') === null;
            if (closed && empty) {
                InputfieldImageReference.fetchAndInsertThumbnails(url, thumbnav);
            }
        });

    },
    fetchAndInsertThumbnails: function (url, thumbnav) {
        thumbnav.innerHTML = '<div uk-spinner></div>';
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    html = xhr.responseText;
                    thumbnav.innerHTML = html;
                } else {
                    console.log('There was a problem with the request.');
                }
            }

        };
        xhr.open('GET', url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send();
    },
    initModalEditImages: function () {
        $(document).on("pw-modal-closed", function (event, ui) {
            if ($(event.target).hasClass('imagereference_editimages')) {
                var link = $(event.target);
                var field = link.closest('.InputfieldImageReference')[0];
                var thumbnav = link.siblings('.uk-thumbnav')[0];
                var pageid = thumbnav.getAttribute('data-pageid');
                var url = ProcessWire.config.InputfieldImageReference.url + '&pageid=' + pageid;
                InputfieldImageReference.fetchAndInsertThumbnails(url, thumbnav, field);
            }
        });
    },
    initSelectAnyPage: function (field) {
        var inputAnypage = field.querySelector("#anypage");
        if (!inputAnypage) return;
        var wrapAnypage = inputAnypage.closest('#wrap_anypage');
        var thumbsField = wrapAnypage.nextSibling;
        var thumbnav = thumbsField.querySelector('.uk-thumbnav');
        var thumbholderLabel = wrapAnypage.nextSibling.querySelector('#imagereference_anypage_pagename');
        $(inputAnypage).on("pageSelected", function (event, data) {
            var pageid = data.id;
            var url = ProcessWire.config.InputfieldImageReference.url + '&pageid=' + pageid;
            var selectedTitle = wrapAnypage.querySelector('.PageListSelectName');
            InputfieldImageReference.fetchAndInsertThumbnails(url, thumbnav);
            thumbholderLabel.innerHTML = selectedTitle.innerHTML;
        });

        $(wrapAnypage).on("click", function (event) {
            if (thumbholderLabel.innerHTML) { // current image was chosen from any page
                thumbsField.classList.toggle('in');
            }
        });


    }
}

document.addEventListener('DOMContentLoaded', InputfieldImageReference.init);

$(document).on('reloaded', '.InputfieldRepeaterItem', InputfieldImageReference.init);
