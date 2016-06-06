/*eslint-env browser, jquery */
/*global adsbygoogle:true, bootstrapModule, swal, Spinner */
/**
 * Common web helpers.
 * @module
 * @external $
 * @external adsbygoogle
 * @external bootstrapModule
 * @external swal
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var commonsModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var defaults = {
        debug: false,
        disabledLogs: ['log', 'time', 'timeEnd'], // , info, warn
        hideHash: true,

        selector: {
            userLanguage: '#user_language, #language, #lang'
        },
        basil: {

        },
        adsense: {
            containers: '.adsbygoogle',
            adClient: 'ca-pub-8495719252049968', // Client id used when attribut is missing
            adSlot: '3723415549', // Default ad slot when attribut is missing
            adFormat: 'auto' // Default ad format when attribut is missing
        },
        garlic: {
            fieldsSelector: '.garlic-auto-save',
            formsSelector: '[data-persist="garlic"]'
        },
        parsley: {
            fieldsSelector: '[data-parsley-id]',
            formsSelector: '[data-parsley-validate]'
        },
        webFontLoader: {
            version: '1.6.16',
            config: {
                google: {
                    families: ['Material+Icons']
                }
                //loading: function() {},
                //active: function() {
                //    //toogleMaterialDesignIconVisibility('show');
                //},
                //inactive: function() {},
                //fontloading: function(familyName, fvd) {},
                //fontactive: function(familyName, fvd) {},
                //fontinactive: function(familyName, fvd) {}
            }
        },
        materialDesign: {
            iconsSelector: '.material-icons' // mdi
        },
        parallax: {
            selector: '[data-type="background"]'
        },
        scrollTo: {
            toggleSelector: '.scroll'
        },
        mixitup: {
            selector: '#disabled_priorities, #faq_list'
        },
        i18next: {
            instance: null
        },
        input: {
            events: 'input change click'
        },
        chosen: {
            events: 'chosen:updated chosen:maxselected'
        },
        bootstrapSwitch: {
            events: ' switchChange.bootstrapSwitch'
        },
        sortable: {
            events: 'sortactivate sortbeforeStop sortchange sortcreate sortdeactivate sortout sortover sortreceive sortremove sort sortstart sortstop sortupdate'
        },
        dataReset: {
            formsSelector: 'form',
            toggleSelector: '.delete_data'
        },
        inputReset: {
            formsSelector: 'form',
            toggleSelector: '.reset_inputs',
            defaultAttribut: 'default-value'
        },
        spinner: {
            selector: '.spinner'
        },
        swal: {
            resetData: {
                title: 'Reset everything',
                text: 'This will erase your roadbook, reset settings and delete all local data stored by this application.',
                type: 'warning',
                confirmButtonText: 'Yes reset',
                cancelButtonText: 'No stop !',
                showCancelButton: true,
                closeOnConfirm: false
                //closeOnCancel: false
            },
            inputReset: {
                title: 'Done',
                text: 'All inputs have been reset to their default values.',
                type: 'success',
                timer: 3000,
                showConfirmButton: false
            }
        }
    };

    var settings = defaults;

    var protocol = (window.location.protocol === 'https:') ? 'https:' : 'http:';

    var basil;

    var spinner = new Spinner(settings.spinner);



    /**
     * Search ad containers in given block and insert ad
     * @private
     * @param {string} [selector="body"] - Div selector from where to start ad block search
     */
    var insertAdsenseAds = function (selector) {

        selector = selector || 'body';

        var $ads = $(selector).find(settings.adsense.containers).filter(':not([data-adsbygoogle-status])');
        var $ad;
        console.log($ads.length + ' uninitialized ad(s) found in ' + selector);

        $ads.each(function (i, ad) {
            $ad = $(ad);
            if ($ad.parents(':not(:visible)').length === 0) {
                if (!$ad.attr('data-ad-client')) {
                    $ad.attr('data-ad-client', settings.adsense.adClient);
                }
                if (!$ad.attr('data-ad-slot')) {
                    $ad.attr('data-ad-slot', settings.adsense.adSlot);
                }
                if (!$ad.attr('data-ad-format')) {
                    $ad.attr('data-ad-format', settings.adsense.adFormat);
                }
                console.log('Adsense attributs added to', '#' + $ad.attr('id'));
                //setTimeout(function () {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    console.log('#' + $ad.attr('id') + ' ad initialised with attributs ', $ad.data());
                //}, 4000);
            } else {
                console.log('#' + $ad.attr('id') + ' ad is in a hidden container and cannot be initialized now');
            }
        });

        // Initialize ads
        /*$ads.each(function (i, ad) {
            var $ad = $(ad);
            (adsbygoogle = window.adsbygoogle || []).push({});
            console.log('#' + $ad.attr('id') + ' ad initialised with attributs ', $ad.data());
        });*/

        // Initialize hidden ads when a pane is opened for the first time
        //bootstrapModule.oneShownHiddenTab(selector, function (paneId) {
        //    insertAdsenseAds(paneId);
        //});
        //insertAdsInHiddenPanes(selector, settings.adsense);

    };



    /**
     * Load the Google Adsense library and add a adsbygoogle-status-done class to the html tag
     * @public
     */
    var adsense = function () {

        $.getScript(protocol + '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', function () {
            console.log('Google Adsense library loaded');
            $('html').addClass('adsbygoogle-status-done');

            /*$(window).on('load', function () {
                if (callback) {
                    callback(selector, insertAdsenseAds(selector));
                } else {
                    insertAdsenseAds(selector)
                }
                var $ads = $('.adsbygoogle').filter('[data-adsbygoogle-status="done"]');
                if ($ads.length) {
                    $('html').addClass('adsbygoogle-status-done');
                } else {
                    console.warn('Ad is not initialized');
                }
            });*/

        });

    };



    /**
     * Parallax
     * @public
     */
    var parallax = function () {

        $(function () {
            var $window = $(window);
            $(settings.parallax.selector).each(function () {
                var $scroll = $(this);
                $window.scroll(function () {
                    var yPos = -($window.scrollTop() / $scroll.data('speed'));
                    var coords = '50% ' + yPos + 'px';
                    $scroll.css({ backgroundPosition: coords });
                });
            });
        });

    };



    /**
     * Scroll-to links
     * @public
     */
    var scrollTo = function (options) {

        $.extend(true, settings.scrollTo, options);

        $(function () {
            $(settings.scrollTo.toggleSelector).click(function () {
                $.scrollTo(this.hash, 1500, {easing: 'swing'});
                return false;
            });
        });

    };



    /**
     * Reset cookies and local storage
     * @private
     */
    var clearLocalStorage = function () {

        if (document.cookie) {
            var cookies = document.cookie.split(';');
            cookies.forEach(function (cookie) {
                document.cookie = cookie.split('=')[0]
                        + '=; username=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
            });
        }
        if (localStorage) {
            localStorage.clear();
        }
        if ($().garlic) {
            $(settings.garlic.fieldsSelector).garlic('destroy');
        }
        if (basil) {
            basil.reset();
        }
    };



    /**
     * Get stored hash from local storage
     * @private
     */
    var restoreHash = function(key, useHash) {
        var hash = location.hash;
        if (!useHash && basil) {
            hash = basil.get(key);
        }
        return hash;
    };



    /**
     * Set hash to local storage
     * @private
     */
    var storeHash = function (key, value, useHash) {
        if (!useHash && basil) {
            basil.set(key, value);
        } else {
            location.hash = value;
        }
    };



    /**
     * Get input value according to type
     * @public
     * @param {Object} input - Input DOM
     * @return {string} Input type
     */
    var getInputType = function (input) {

        var inputType;

        var $input = $(input);
        if ($input) {

            inputType = $input.attr('type');
            if (!inputType || inputType === 'undefined') {
                inputType = $input.prop('tagName').toLowerCase();
            }

        }

        return inputType;

    };



    /**
     * Get input value according to type
     * @public
     * @param {Object} input - Input DOM
     * @return {String|number|boolean} Input value
     */
    var getInputValue = function (input) {

        var value;

        var $input = $(input);
        if ($input) {

            var inputType = getInputType($input);

            if ($.inArray(inputType, ['radio', 'checkbox']) !== -1) {
                value = $input.prop('checked');
                if (value && $input.attr('value')) {
                    value = $input.attr('value');
                }
            } else if (inputType === 'file') {
                value = $input.prop('files');
            } else if ($.inArray(inputType, ['text', 'password', 'select', 'textarea', 'hidden',
                'color', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'range',
                'search', 'tel', 'time', 'url', 'week']) !== -1) {
                value = $input.val();
            } else {
                // 'image' , 'button', 'reset', 'submit' , etc...
                value = $input.html();
            }

            /*if (inputType === 'checkbox' || inputType) === 'radio') {
                value = (input.checked);
            } else if (inputType === 'file') {
                value = input.files;
            } else {
                value = input.value;
            }*/

        }

        return value;

    };



    /**
     * Set input value according to type
     * @public
     * @param {Object} input - Input DOM
     * @param {String|number|boolean} [value] - Input value
     * @param {Boolean} [trigger] - If false, do not trigger change
     */
    var setInputValue = function (input, value, trigger) {

        var $input = $(input);
        if ($input) {

            var inputType = getInputType($input);

            // If value is an array, use the first element
            if ($.isArray(value) && inputType !== 'textarea') {
                value = value[0] || null;
            }

            if ($.inArray(inputType, ['radio', 'checkbox']) !== -1) {
                //if (value === true || value === false) {
                    $input.prop('checked', value);
                //} else {
                //    $input.val(value);
                //    $input.prop('checked', (value !== null) ? true : false);
                //}
            } else if (inputType === 'file') {
                if ($.type(value) === 'FileList') {
                    $input.attr('files', value);
                }
            } else if (inputType === 'textarea') {
                if ($.isArray(value)) {
                    value = value.join('\n');
                }
                $input.val(value);
            } else if ($.inArray(inputType, ['text', 'password', 'select', 'hidden',
                'color', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'range',
                'search', 'tel', 'time', 'url', 'week']) !== -1) {
                $input.val(value);
            } else {
                $input.html(value);
            }

            if (trigger !== false) {
                $input.trigger('change');
            }

        }

    };



    /**
     * Data persistence inputs
     * @public
     */
    var storeInputChanges = function () {

        if (!basil) {
            if (typeof Basil === 'function') {
                basil = new window.Basil(settings.basil);
            } else {
                return false;
            }
        }

        var $form, $input, value, id;

        $(settings.garlic.formsSelector).each(function () {

            $form = $(this);
            $form.find(':input').not(':button, [type="submit"], [type="reset"]').filter('[id]').each(function () {
                $input = $(this);

                // Restore value if a stored value exists
                id = $input.attr('id');
                value = basil.get(id);
                if (value !== null) {
                    setInputValue($input, value, false);
                    console.log('#' + id + ' value restored', value);
                }

                // Store changes
                $input.on('change', function (e) {
                    var input = e.target;
                    value = getInputValue(input);
                    id = input.id;
                    basil.set(id, value);
                    console.log('#' + id + ' value stored', value);
                });

            });
        });

    };



    /**
     * Save inputs value to the data-default-value attribut
     * @public
     * @param {String} [selector="body"] - Form or block selector
     */
    var fixInputValues = function (selector) {

        if (!settings.inputReset.defaultAttribut) {
            return false;
        }

        if (!selector) {
            selector = settings.dataReset.formsSelector;
        }

        var $input, value;

        $(selector).find(':input')
        .not(':file, :button, [type="submit"], [type="reset"]')
        .each(function () {
            $input = $(this);
            value = getInputValue(this);
            $input.attr('data-' + settings.inputReset.defaultAttribut, value);
        });

    };



    /**
     * Reset inputs value using the data-default-value attribut
     * @public
     * @param {String} [selector="body"] - Form or block selector
     */
    var resetInputValues = function (selector) {

        var $input, id, value;

        if (!settings.inputReset.defaultAttribut) {
            return false;
        }

        if (!selector) {
            selector = settings.inputReset.formsSelector;
        }

        $(selector).find(':input').filter('[data-' + settings.inputReset.defaultAttribut + ']').each(function () {

            $input = $(this);
            id = $input.attr('id');
            value = $input.data(settings.inputReset.defaultAttribut);

            if (id) {
                if (basil) {
                    basil.remove(id);
                }
                setInputValue(this, value);
            }

        });

    };



    /**
     * Reset cookies and local storage
     * Display a warning alert when user click the button, then reset cookies and local storage and reload
     * @public
     */
    var watchResetDataButton = function () {

        $(settings.dataReset.toggleSelector).click(function () {
            if (swal) {
                swal(settings.swal.resetData, function (isConfirm) {
                    if (isConfirm) {
                        clearLocalStorage();
                        location.reload();
                    }
                });
            } else {
                clearLocalStorage();
                location.reload();
            }
        });

    };



    /**
     * Watch input reset button
     * @public
     */
    var watchInputResetButton = function () {

        $(settings.inputReset.toggleSelector).click(function () {
            resetInputValues();
            if (swal) {
                swal(settings.swal.inputReset);
            }
        });

    };



    /**
     * Show or hide material icons
     * Hide icons while Google fonts are no loaded to avoid class name display
     * @private
     * @param {Object} settings - See defaults
     */
    /*var toogleMaterialDesignIconVisibility = function (state) {

        if (settings.webFontLoader.config.google && settings.webFontLoader.config.google.length) {
            $.each(settings.webFontLoader.config.google, function (i, fontName) {
                if (fontName.match(/Material[+ ]Icons/gi)) {
                    var $icons = $(settings.materialDesign.iconsSelector);
                    if (state) {
                        $icons.show();
                        console.log('Material design icons diplayed');
                    } else {
                        $icons.hide();
                        console.log('Material design icons hidden');
                    }
                    return false;
                }
            });
        }

    };*/



    /**
     * Load Google fonts asynchronously
     * @see https://github.com/typekit/webfontloader
     * @public
     * @param {Object} settings - See defaults
     */
    var loadWebFonts = function (options) {

        $.extend(true, settings.googleFonts, options);

        // WebFontConfig must be defined globally
        if (!window.WebFontConfig) {
            if (settings.webFontLoader.config) {
                window.WebFontConfig = {};
                $.extend(true, window.WebFontConfig, settings.webFontLoader.config);
            } else {
                console.warn('Global variable WebFontConfig is not defined');
                return false;
            }
        }

        (function (d) {
            // Hide material design icons until font was loaded
            //toogleMaterialDesignIconVisibility('hide');
            // Append the font loader script to the body
            var wf = d.createElement('script'), s = d.scripts[0];
            wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/' + settings.webFontLoader.version + '/webfont.js';
            s.parentNode.insertBefore(wf, s);
        })(document);

    };



    /**
     * Disable most logs
     * @public
     */
    var hideLogs = function () {

        console.log = function () {};
        console.time = function () {};
        console.timeEnd = function () {};

        settings.disabledLogs.forEach(function (element) {
            console[element] = function () {};
        });

    };



    /**
     * Print some global logs or hide them for production
     * @public
     * @param {Object} settings - See defaults
     */
    var debug = function () {

        if (!settings.debug) {
            hideLogs();
            $('.debug-only').hide();
            return false;
        } else {
            $('.debug-only').show();
            console.log('Debug', settings.debug);
        }

        // All inputs
        if (settings.input.events) {

            var events = settings.input.events;
            if ($().chosen) { events = events + settings.chosen.events; }
            if ($().bootstrapSwitch) { events = events + settings.bootstrapSwitch.events; }

            $(':input').on(events, function (e) {
                var strings = [];
                strings.push('"' + e.type + '" event fired on "' + e.target.tagName + '" element');
                if (e.target.type) { strings.push('[type="' + e.target.type + '"]'); }
                if (e.target.id) { strings.push('[id="' + e.target.id + '"]'); }
                if (e.target.name) { strings.push('[name="' + e.target.name + '"]'); }
                if (e.type === 'input' || e.type === 'change') {
                    strings.push('value="' + e.target.value + '"');
                    if (e.target.type === 'checkbox' || e.target.type === 'radio') { strings.push('checked="' + e.target.checked + '"'); }
                }
                console.log(strings.join(' '), e);
            });
        }

        // DOM load events
        console.time('jQuery is ready');
        console.time('HTML is loaded and DOM is ready');
        console.time('Images, frames and objects are loaded');
        $(function () {
            console.timeEnd('jQuery is ready');
        });
        $(document).ready(function () {
            console.timeEnd('HTML is loaded and DOM is ready');
        });
        $(window).on('load', function () {
            console.timeEnd('Images, frames and objects are loaded');
        });

        // Infos
        console.log('document.domain', document.domain);
        console.log('document.URL', document.URL);
        console.log('location', location);
        console.log('navigator', navigator);
        //console.log('window.location', window.location);
        //console.log('document.location', document.location);

        // jQuery UI sortable events
        if ($().sortable && settings.sortable.events) {
            // @param event, ui
            $('.ui-sortable').on(settings.sortable.events, function (event) {
                console.log('#' + $(this).attr('id') + ' event '
                + event.type + '(' + $(this).sortable('toArray').length + ')');
            });
        }

        // mixitup events
        if ($().mixitup && settings.mixitup.selector) {
            $(settings.mixitup.selector).on('mixLoad mixStart mixEnd mixFail mixBusy', function (event, state) {
                console.log('mixItUp ' + event.type + ': ' + state.totalShow + ' elements match the current filter');
            });
        }

        // Garlic
        if ($().garlic && settings.garlic.fieldsSelector) {
            $(settings.garlic.selector).garlic({
                onRetrieve: function (elem, retrievedValue) {
                    console.log('Garlic retrieved for'
                    + ' ' + ((elem.attr('id')) ? 'id="#' + elem.attr('id') + '"' : '')
                    + ' ' + ((elem.attr('name')) ? 'name="#' + elem.attr('name') + '"' : '')
                    , retrievedValue);
                },
                onPersist: function (elem, storedValue) {
                    console.log('Garlic persisted value for'
                    + ' ' + ((elem.attr('id')) ? 'id="#' + elem.attr('id') + '"' : '')
                    + ' ' + ((elem.attr('name')) ? 'name="#' + elem.attr('name') + '"' : '')
                    , storedValue);
                }
            });
        }

        // Parsley form validation
        if ($().parsley) {
            $.each(['form:init', 'form:validate', 'form:success', 'form:error', 'form:validated', 'form:submit', 'field:init', 'field:validate', 'field:success', 'field:error', 'field:validated'], function (i, eventType) {
                window.Parsley.on(eventType, function() {
                    //console.log('Parsley ' + eventType, this.$element);
                    console.log('Parsley ' + eventType, '#' + this.$element.attr('id'));
                });
            });
        }

        // i18next
        if (typeof i18next === 'function' && settings.i18next.instance) {

           settings.i18next.instance.useLocalStorage = false;
           settings.i18next.instance.localStorageExpirationTime = 0;

            settings.i18next.instance
                .on('initialized', function () {
                    console.log('i18next initialized');
                })
                .on('loaded', function () {
                    console.log('i18next loaded');
                })
                .on('failedLoading', function (lng, ns, msg) {
                    console.warn('i18next failed loading: ' + msg + ' language: ' + lng + ' ns: ' + ns);
                });
        }

        // BootstrapSwitch checkbox events
        /*if ($().bootstrapSwitch && settings.bootstrapSwitch.events) {
            $(':checkbox')
                .on(settings.bootstrapSwitch.events, function (event, state) {
                    console.log('bootstrapSwitch #' + $(this).attr('id') + '=' + this.checked);
                });
        }*/

         // Chosen select events
        /*if ($().chosen) {
            $(':select').on('chosen:updated', function () {
                console.log('Chosen input #' + $(this).attr('id') + '=' + $(this).val());
            });
        }*/

    };



    /**
     * Load data from input type="file"
     * @public
     * @param {Object} files - File list returned by the input
     * @param {Function} callback - Function to apply to each file
     * @param {Object} [options] - File type definition
     * @return {Object} Deferred
     */
    var reader = function (files, callback, options) {

        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            return false;
        }

        var dfd = new $.Deferred();
        var n = 0;

        spinner.addJob(dfd);

        options = $.extend(true, {}, {
            format: 'text',
            encoding: 'UTF-8',
            cancelSelector: null
        }, options);

        $.each(files, function (i, f) {
            var fileReader = new FileReader();

            if (options.format === 'buffer') {
                fileReader.readAsArrayBuffer(f, options.encoding);
            } else if (options.format === 'binary') {
                fileReader.readAsBinaryString(f, options.encoding);
            } else if (options.format === 'data') {
                fileReader.readAsDataURL(f, options.encoding);
            } else {
                fileReader.readAsText(f, options.encoding);
            }

            //fileReader.error
            //fileReader.readyState
            //fileReader.result

            fileReader.onload = function (e) {
                console.log('File load', e);
                callback(e.target.result);
            };
            fileReader.onloadstart = function () {

            };
            fileReader.onloadend = function () {
                console.log((i + 1) + '/' + files.length + ' file loaded');
                n = n + 1;
                if (n === files.length) {
                    console.log('Last file loaded');
                    dfd.resolve();
                }
            };
            fileReader.onerror = function () {
                swal({title: 'Oups!', text: 'An error occured while trying to read your file.', type: 'warning'});
            };

            if (options.cancelSelector) {
                $(options.cancelSelector).on('click', function () {
                    fileReader.abort();
                });
            }

        });

        return dfd;

    };



    /**
     * Add a .disabled class to unsupported inputs
     * @public
     */
    var disableUnsupported = function () {

        // Disable file inputs if they are not supported
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            $('input[type="file"]').addClass('disabled');
            console.warn('The File APIs are not fully supported by your browser.');
        }

    };



    /**
     * Prevent URL hash display with internal links
     * @public
     * @param {String} [selector='body'] - Container selector
     */
    var hideHashOnClick = function (selector) {

        var $container = $(selector || 'body');
        var $link;

        if ($container) {
            $container.find('a[href^="#"]').each(function (i, el) {
                $link = $(this);
                console.log('Watching internal links clicks', $(el).attr('href'));
                $link.on('click', function (e) {
                    var hash = location.hash.replace('#', '');
                    if(hash !== '') {
                        location.hash = '';
                    }
                    console.log('URL hash hidden', e.currentTarget.hash);
                });
            });
        }

    };



    /**
     * Check if object is an instance a class
     * @public
     * @param {Object} instance - Object instance
     * @param {Object} ofTheClass - Static class
     * @param {Array} childes - Possible children names
     * @return {Array} Object Classes
     */
    var getInstancesOf = function (instance, ofTheClass, children) {

        var types = [];

        children.forEach(function (v) {
            if (ofTheClass[v]) {
                if (instance instanceof ofTheClass[v]) {
                    types.push(v);
                }
            } else {
                console.log(v + ' is not defined');
            }
        });

        return types;

    };



    /**
     * Try to define user language and populate language inputs
     * @public
     * @param {String} [language] - Language code ISO2
     */
    var setUserLanguage = function (language) {

        var value = language || navigator.language || navigator.userLanguage || navigator.languages[0] || 'en';
        console.log('User language defined', value);

        $(settings.selector.userLanguage).each(function () {
            $(this).val(value).trigger('change');
        });

    };



    /**
     * Apply all
     * @public
     */
    var init = function (options) {

        // Merge default and custom settings
        settings = $.extend(true, {}, defaults, options);

        // Show a lot of information in console
        if (settings.debug) {
            debug();
        }
        // Load Google fonts asynchronously (+ Material design icons)
        if (settings.webFontLoader) {
            loadWebFonts();
        }

        $(function () {

            // Try to define user language then populate select input
            setUserLanguage();

            // Save input values to a data attribute and watch the "live-reset-all" button
            if (settings.inputReset) {
                fixInputValues();
                watchInputResetButton();
            }

            // Make form fields persistent
            if (typeof Basil === 'function' && settings.basil) {
                storeInputChanges();
            }

            // Watch the reset button clicks and clear cookies / local storage
            if (settings.dataReset) {
                watchResetDataButton();
            }

            // Hide hash in URL when user click a link
            if (settings.hideHash) {
                hideHashOnClick();
            }

            // Add a disabled class to unsuported field types
            disableUnsupported();

            // Scroll to internal link
            if (settings.scrollTo) {
                scrollTo();
            }

            // A simple parallax function
            if (settings.parallax) {
                parallax();
            }

            // Initialize Adsense ads in hidden tabs
            if (settings.adsense) {
                adsense();
            }

        });

    };



    // Public functions
    return {
        //adsense: adsense,
        //debug: debug,
        //disableUnsupported: disableUnsupported,
        //fixInputValues: fixInputValues,
        //hideHashOnClick: hideHashOnClick,
        //loadWebFonts: loadWebFonts,
        //parallax: parallax,
        //resetButton: resetButton,
        //scrollTo: scrollTo,
        storeInputChanges: storeInputChanges,
        basil: basil,
        getInputType: getInputType,
        getInputValue: getInputValue,
        getInstancesOf: getInstancesOf,
        hideLogs: hideLogs,
        init: init,
        insertAdsenseAds: insertAdsenseAds,
        reader: reader,
        resetInputValues: resetInputValues,
        restoreHash: restoreHash,
        setInputValue: setInputValue,
        setUserLanguage: setUserLanguage,
        storeHash: storeHash,
        watchInputResetButton: watchInputResetButton
    };

})();
