/*eslint-env browser, jquery */
/*global adsbygoogle:true, bootstrapModule, swal */
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

    var settings = {
        basil: {
        },
        debug: {
            debugMode: ((parseInt($.urlParam('debug'))) ? true : false), // (document.domain === 'localhost')
            disabledLogs: ['log', 'time', 'timeEnd'] // , info, warn
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
            iconsSelector: '.material-icons'
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
        reset: {
            formsSelector: 'form',
            toggleSelector: '#reset_all',
            defaultAttribut: 'default-value'
        },
        swal: {
            resetWarning: {
                title: 'Reset everything?',
                text: 'This will erase your roadbook, reset settings and delete all local data stored by this application.',
                type: 'warning',
                confirmButtonText: 'Yes reset',
                cancelButtonText: 'No stop !',
                showCancelButton: true,
                closeOnConfirm: false
                //closeOnCancel: false
            }/*,
            resetConfirmation: {
                title: 'Cancelled',
                text: 'You can continue where you left off.',
                type: 'error',
                timer: 3000,
                showConfirmButton: false
            }*/
        }
    };



    if (typeof Basil === 'function') {
        var basil = new window.Basil(settings.basil);
    }



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
     * Search Bootstrap hidden tabs
     * @private
     * @param {string} selector - Div selector from where to start ad block search
     * @param {string} settings - Adsense settings
     */
    /*var insertAdsInHiddenPanes = function (selector, settings) {

        var $block = $(selector);
        if (!$block) return false;
        // Seach for hidden tabs
        $block.find(settings.tabLinksSelector).filter(':not(.active)').each(function (i, tab) {
            $(tab).one('shown.bs.tab', function (e) {
                var paneId = $(e.target).attr('href');
                insertAdsenseAds(paneId, settings);
            });
        });
    };*/



    /**
     * Load the Google Adsense library and add a adsbygoogle-status-done class to the html tag
     * @public
     */
    var adsense = function () {

        $.getScript('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', function () {
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
     * Data persistence inputs
     * @public
     */
    var storeForms = function () {

        if (!basil) {
            return false;
        }

        var $form, $input, value, id;

        $(settings.garlic.formsSelector).each(function () {

            $form = $(this);

            $form.find(':input').not(':file').not(':button').not('[type="submit"]').not('[type="reset"]').filter('[id]').each(function () {
                $input = $(this);

                // Copy the default value to a data-default-value attribut (for reset function)
                /*if (settings.reset.defaultAttribut) {
                    if ($input.attr('type') === 'checkbox' || $input.attr('type') === 'radio') {
                        value = $input.prop('checked');
                    } else {
                        value = $input.val();
                    }
                    $input.attr('data-' + settings.reset.defaultAttribut, value);
                }*/

                // Restore value if a stored value exists
                id = $input.attr('id');
                value = basil.get(id);
                if (value !== null) {
                    if ($input.attr('type') === 'checkbox' || $input.attr('type') === 'radio') {
                        $input.prop('checked', value);
                    } else {
                        $input.val(value);
                    }
                    console.log('#' + id + ' value restored', value);
                }

                // Store changes
                $input.on('change', function () {
                    $input = $(this);
                    if ($input.attr('type') === 'checkbox' || $input.attr('type') === 'radio') {
                        value = $input.prop('checked');
                    } else {
                        value = $input.val();
                    }
                    id = $input.attr('id');
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

        if (!settings.reset.defaultAttribut) {
            return false;
        }

        if (!selector) {
            selector = settings.reset.formsSelector;
        }

        var $input, value, type;

        $(selector).find(':input')
        .not(':file').not(':button').not('[type="submit"]').not('[type="reset"]')
        .each(function () {

            $input = $(this);
            type = $input.attr('type');

            // Copy the default value to a data-default-value attribut (for reset function)
            if (type === 'checkbox' || type === 'radio') {
                value = $input.prop('checked');
            } else {
                value = $input.val();
            }
            $input.attr('data-' + settings.reset.defaultAttribut, value);

        });

    };



    /**
     * Reset inputs value using the data-default-value attribut
     * @public
     * @param {String} [selector="body"] - Form or block selector
     */
    var resetInputValues = function (selector) {

        var $input, id, type, value;

        if (!settings.reset.defaultAttribut) {
            return false;
        }

        if (!selector) {
            selector = settings.reset.formsSelector;
        }

        $(selector).find(':input').filter('[data-' + settings.reset.defaultAttribut + ']').each(function () {

            $input = $(this);
            id = $input.attr('id');
            type = $input.attr('type');
            value = $input.data(settings.reset.defaultAttribut);

            if (id) {
                if (type === 'checkbox' || type === 'radio') {
                    $input.prop('checked', value);
                } else {
                    $input.val(value);
                }
                if (basil) {
                    basil.remove(id);
                }
            }

        });

    };



    /**
     * Reset cookies and local storage
     * Display a warning alert when user click the button, then reset cookies and local storage and reload
     * @public
     */
    var resetButton = function () {

        $(function () {

            $(settings.reset.toggleSelector).click(function () {
                if (swal) {
                    swal(settings.swal.resetWarning, function (isConfirm) {
                        if (isConfirm) {
                            clearLocalStorage();
                            location.reload();
                        }/* else {
                            swal(settings.swal.resetConfirmation);
                        }*/
                    });
                } else {
                    clearLocalStorage();
                    location.reload();
                }
            });

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

        // WebFontConfig must be defined globally at the top of this file
        window.WebFontConfig = {};
        // Define the webfont loader config
        $.extend(true, window.WebFontConfig, settings.webFontLoader.config);

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
     * Print some global logs or hide them for production
     * @public
     * @param {Object} settings - See defaults
     */
    var debug = function () {

        if (!settings.debug.debugMode) {
            console.log = function () {};
            console.time = function () {};
            console.timeEnd = function () {};
            // @param element, index, array
            settings.debug.disabledLogs.forEach(function (element) {
                console[element] = function () {};
            });
            $('.debug-only').hide();
            return false;
        } else {
            $('.debug-only').show();
            console.log('Debug mode', settings.debug.debugMode);
        }

        // All inputs
        if (settings.input.events) {

            var events = settings.input.events;
            if ($().chosen) { events = events + settings.chosen.events; }
            if ($().bootstrapSwitch) { events = events + settings.bootstrapSwitch.events; }

            $(':input').on(events, function (e) {
                var $input = $(this);
                var strings = [];
                strings.push('"' + e.type + '" event fired on "' + $input.prop('tagName') + '" element');
                if ($input.attr('type')) { strings.push('[type="' + $input.attr('type') + '"]'); }
                if ($input.attr('id')) { strings.push('[id="' + $input.attr('id') + '"]'); }
                if ($input.attr('name')) { strings.push('[name="' + $input.attr('name') + '"]'); }
                if (e.type === 'input' || e.type === 'change') {
                    strings.push('value="' + $input.val() + '"');
                    if ($input.attr('type') === 'checkbox' || $input.attr('type') === 'radio') { strings.push('checked="' + this.checked + '"'); }
                }
                console.log(strings.join(' '));
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

        // URL infos
        console.log('location.hostname', location.hostname);
        console.log('document.location.hostname', document.location.hostname);
        console.log('window.location.hostname', window.location.hostname);
        console.log('document.domain', document.domain);
        console.log('document.URL', document.URL);
        console.log('document.location.href', document.location.href);
        console.log('document.location.origin', document.location.origin);
        console.log('document.location.host', document.location.host);
        console.log('document.location.pathname', document.location.pathname);

        // Language
        console.log('navigator.language', navigator.language);
        console.log('navigator.userLanguage', navigator.userLanguage);

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
     */
    var hideHash = function () {

        var hash = location.hash.replace('#', '');
        if(hash !== '') {
            location.hash = '';
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
                    hideHash();
                    console.log('URL hash hidden', e.currentTarget.hash);
                });
            });
        }

    };



    /**
     * Apply all
     * @public
     */
    var init = function () {
        // Show a lot of information in console
        debug();
        // Load Google fonts asynchronously (+ Material design icons)
        loadWebFonts();
        // Initialize Adsense ads in hidden tabs
        adsense();
        // Save input values to a data attribute (used for live reset)
        fixInputValues();
        // Make form fields persistent
        storeForms();
        // Add a disabled class to unsuported field types
        disableUnsupported();
        // A simple parallax function
        parallax();
        // Watch the reset button clicks and clear cookies / local storage
        resetButton();
    };



    // Public functions
    return {
        init: init,
        adsense: adsense,
        insertAdsenseAds: insertAdsenseAds,
        basil: basil,
        debug: debug,
        disableUnsupported: disableUnsupported,
        loadWebFonts: loadWebFonts,
        parallax: parallax,
        storeForms: storeForms,
        reader: reader,
        resetButton: resetButton,
        scrollTo: scrollTo,
        storeHash: storeHash,
        hideHash: hideHash,
        hideHashOnClick: hideHashOnClick,
        restoreHash: restoreHash,
        fixInputValues: fixInputValues,
        resetInputValues: resetInputValues
    };

})();
