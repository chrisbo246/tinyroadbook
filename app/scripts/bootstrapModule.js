/*eslint-env browser, jquery */
/*global commonsModule, escape, formatBytes */
/**
 * Bootstrap helpers.
 * @module
 * @external $
 * @external commonsModule
 * @external escape
 * @external formatBytes
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var bootstrapModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var defaults = {
        debug: false,
        useHash: true,
        basil: {
            namespace: 'bootstrap'
        },
        modal: {
            modalSelector: '.modal',
            toggleSelector: '[data-toggle="modal"]',
            storeActive: false
        },
        tab: {
            toggleSelector: '[data-toggle="tab"]',
            storeActive: true,
            useHash: false
        },
        tooltip: {
            toggleSelector: '[data-toggle="tooltip"]', //, [rel="tooltip"]
            options: {}
        },
        switchButton: {
            togglerSelector: '.btn-switch'
        }
    };

    var settings = defaults;



    /**
     * Save / restore the last displayed tab  using local storage
     * Usage: tabModule.rememberTab('#main-nav', !localStorage);
     * Tab links must contain a data-toggle attribut
     * @public
     * @param {string} linksSelector - Tab links selector
     * @param {boolean} useHash - Restore tab from URL hash or the transparent localStorage method ?
     */
    var restoreActiveTab = function () {

        if (typeof window.Basil === 'undefined') {
            console.warn('Basil is not loaded');
            return false;
        }

        if (typeof $.fn.tab === 'undefined') {
            console.warn('Bootstrap tab plugin is not loaded');
            return false;
        }

        var basil = new window.Basil(settings.basil);
        var $tabs = $(settings.tab.toggleSelector);
        var storageKey = 'activeTab';
        var storageValue;

        if ($tabs) {

            // Try to detect which tab to open
            if (!settings.tab.useHash && basil) {
                // The stored hash
                storageValue = basil.get(storageKey);
                console.log('Hash restored', storageValue);
            } else {
                // Or the URL hash
                storageValue = location.hash;
                console.log('URL hash detected', storageValue);
            }

            // Show the tab according to the defined hash
            if (storageValue) {
                var $tab = $tabs.filter('[href="' + storageValue + '"]').first();
                $tab.tab('show');
                console.log('Last active tab restored', storageValue);
            }

            // Then watch tab changes
            $tabs.on('shown.bs.tab', function (e) {

                // Get the selected tab hash
                storageValue = e.target.hash;

                if (storageValue) {
                    if (!settings.tab.useHash && basil) {
                        // Save the current tab hash to local storage
                        basil.set(storageKey, storageValue);
                        console.log('Active tab stored', storageValue);
                    } else {
                        // If URL hash use is allowed, append hash to the URL
                        location.hash = storageValue;
                        console.log('Active tab hash added to URL', storageValue);
                    }
                }

            });

        }

    };



    /**
     * Tabs helpers
     * @public
     */
    var tab = function () {

        if (!$().tab) {
            return false;
        }

        var $togglers = $(settings.tab.toggleSelector);
        if ($togglers) {

            // Dropdown with [data-toggle="tab"] fix (li stay active)
            $togglers.on('click', function () {
                $('.dropdown-menu').find('.active').removeClass('active');
            });

        }

    };



    /**
     * Save / restore the last displayed modal using local storage
     * Usage: tabModule.rememberTab('#main-nav', !localStorage);
     * Tab links must contain a data-toggle attribut
     * @public
     * @param {string} linksSelector - Tab links selector
     * @param {boolean} useHash - Restore tab from URL hash or the transparent localStorage method ?
     */
    var restoreActiveModal = function () {

        if (typeof Basil !== 'undefined' && typeof ($.fn.modal) !== 'undefined') {

            var basil = new window.Basil(settings.basil);

            var $modals = $(settings.modal.modalSelector);
            var storageKey = 'activeModal';
            var storageValue = basil.get(storageKey);

            if ($modals) {

                if (storageValue) {
                    var $modal = $(storageValue);
                    $modal.modal('show');
                    console.log('Last active modal restored', storageValue);
                }

                $modals.on('shown.bs.modal', function (e) {
                    storageValue = '#' + e.target.id;
                    if (storageValue) {
                        basil.set(storageKey, storageValue);
                        console.log('Active modal stored', storageValue);
                    }
                });
                $modals.on('hidden.bs.modal', function () {
                    basil.set(storageKey, null);
                    console.log('Active modal stored', null);
                });
            }

        } else {
            console.warn('Bootstrap modal plugin is not loaded');
        }

    };



    /**
     * Customize modal using the toggler data attributs
     * @public
     */

    var modalTogglerAttributs = function () {

        if (!$().modal) {
            return false;
        }

        // When the modal show up
        $(settings.modal.modalSelector).on('show.bs.modal', function (event) {

            var $modal = $(this);
            var $button = $(event.relatedTarget);
            var data = $button.data();
            var $el;

            // Display only the section according to data-section value
            if (data) {

                if (data.filter) {
                    var $sections = $modal.find('section');
                    console.log('Modal section filter', data.filter);
                    var $section;
                    if ($sections) {
                        $sections.each(function () {
                            $section = $(this);
                            //if ($section.data('section') === data.targetSection) {
                            if ($section.is(data.filter)) {
                                $section.show();
                            } else {
                                $section.hide();
                            }
                        });
                    }
                }

                // Change default text using toggler data attributs
                if (data.title) {
                    $el = $modal.find('.modal-title').first();
                    if ($el) {
                        $el.text(data.title);
                    }
                }
                if (data.ok) {
                    $el = $modal.find('.modal-footer .btn-primary').first();
                    if ($el) {
                        $el.text(data.ok);
                    }
                }
                if (data.ok) {
                    $el = $modal.find('.modal-footer [data-dismiss="modal"]').first();
                    if ($el) {
                        $el.text(data.ok);
                    }
                }
            }

        });

    };



    /**
     * Build the list of files loaded by reader
     * @public
     * @param {Array} files - File list returned by the input change event (e.target.files)
     * @return {String} The file list (HTML)
     */
    var buildFileList = function (files) {

        if (!files) {
            return false;
        }

        var listItems = [];
        $.each(files, function (i, f) {
            listItems.push('<li class="list-group-item">'
            + escape(f.name) + ' <span class="badge">'
            + formatBytes(f.size)
            + (' ' + f.type || '')
            //+ (f.lastModifiedDate ? ' last modified: ' + f.lastModifiedDate.toLocaleDateString() : '')
            + '<span></li>');
        });

        return '<ul class="list-group">' + listItems.join('') + '</ul>';

    };



    /**
     * Execute a callback once hidden tabs become visible for the first time
     * @public
     * @param {string} selector - Div selector from where to start searching
     * @param {Function} callback - function to execute once the tab become visible
     */
    var oneShownHiddenTab = function (selector, callback) {

        var $block = $(selector);
        if (!$block) {
            return false;
        }

        //$block.find(settings.tab.toggleSelector).filter(':not(.active)').each(function (i, toggler) {
        $block.find(settings.tab.toggleSelector).one('shown.bs.tab', function (e) {
            //$(toggler).one('shown.bs.tab', function (e) {
                var paneId = $(e.target).attr('href');
                callback(paneId);
            //});
        });

    };



    /**
     * Display a tooltip to show selected range value
     * @public
     */
    var rangeValueTooltip = function () {

        var $input;

        $('input[type="range"]').each(function () {

            $input = $(this);

            // Initially define the tooltip title with the default value
            $input.attr('data-original-title', $input.val());

            // Watch changes, update the title and show up the tooltip
            $input.on('input', function (e) {
                $(this).attr('data-original-title', e.target.value).tooltip('show');
            });

            // Show the tooltip when user focus the field
            $input.on('focus', function () {
                $(this).tooltip('show');
            });

        });

    };



    /**
     * Initialize tooltips
     * @public
     */
    var tooltip = function () {

        if ($().tooltip) {
            $(settings.tooltip.toggleSelector).tooltip(settings.tooltip.options);
        }

    };



    /**
     * Print some logs
     * @public
     * @param {Object} settings - See defaults
     */
    var debug = function () {

        if (!settings.debug) {
            commonsModule.hideLogs();
            return false;
        }

        console.log('Bootstrap debug started');

        if ($().tab) {
            console.log('Tab plugin loaded');
            var $tabs = $(settings.tab.toggleSelector);
            console.log($tabs.length + ' tab(s) found');
            $tabs.on('shown.bs.tab hidden.bs.tab', function (e) {
                console.log(e.target.href + ' tab ' + e.type, e);
            });
        }

        if ($().modal) {
            console.log('Modal plugin loaded');
            var $modals = $(settings.modal.modalSelector);
            console.log($modals.length + ' modal(s) found');
            $modals.on('shown.bs.modal hidden.bs.modal', function (e) {
                console.log('#' + e.target.id + ' modal ' + e.type, e);
            });
        }

    };



    /**
     * Prevent URL hash display with internal links
     * @public
     */
    var hideHashOnShown = function () {

        if ($().tab) {
            var $tabs = $(settings.tab.toggleSelector);
            $tabs.on('shown.bs.tab', function () {
                commonsModule.hideHash();
            });
        }

        if ($().modal) {
            var $modals = $(settings.modal.modalSelector);
            $modals.on('shown.bs.modal', function () {
                commonsModule.hideHash();
            });
        }

    };



    /**
     * Open the tab / modal when user use internal link in URL
     * @public
     */
    var useHash = function () {

       if(window.location.hash) {
            var hash = window.location.hash;
            console.log('Use hash', hash);

            var $link = $('a[href="' + hash + '"]');
            var $target = $(hash);

            if ($().tab && $link && $link.is(settings.tab.toggleSelector)) {
                $link.tab('show');
            }

            if ($().modal && $link && $link.is(settings.modal.toggleSelector) && $target) {
                $target.modal('show');
            }

        }

    };



    /**
     * Keep clicked buttons active
     * @private
     */
    var watchSwitchButtons = function () {

        $(settings.switchButton.togglerSelector).click(function () {

            var $button = $(this);

            // If the button is in a button group, start by removing .active buttons
            $(this).parents('.btn-group').find(settings.switchButton.togglerSelector).filter('.active').removeClass('active');

            // Then add the .active class to the clicked button
            $button.toggleClass('active');

        });

    };



    /**
     * Data persistence inputs
     * @public
     */
    var storeSwitchButtonState = function () {

        if (typeof Basil === 'undefined') {
            return false;
        }

        var basil = new window.Basil(settings.basil);

        var $button, $buttons, value, id;

        $(settings.switchButton.togglerSelector).filter('[id]').each(function () {
            $button = $(this);

            // Store changes
            $button.on('click', function () {

                // If the button is in a button group, reset all stored values
                $buttons = $(this).parents('.btn-group').find(settings.switchButton.togglerSelector).filter('[id]');
                if (!$buttons.length) {
                    $buttons = $(this);
                }

                $buttons.each(function () {
                    $button = $(this);
                    value = $button.hasClass('active');
                    id = $button.attr('id');
                    basil.set(id, value);
                    console.log('#' + id + ' button state stored', value);
                });

            });

            // Restore button state if a stored value exists
            id = $button.attr('id');
            value = basil.get(id);
            if (value !== null) {
                if (value) { // && !$button.hasClass('active')
                    $button.trigger('click');
                } else {
                    $button.removeClass('active');
                }
                console.log('#' + id + ' button click fired', value);
            }

        });

    };


    /**
     * Initialization
     * @public
     */
    var init = function (options) {

        // Merge default and custom settings
        settings = $.extend(true, {}, defaults, options);

        debug();

        $(function () {

            if (settings.useHash) {
                useHash();
            }

            if ($().tooltip && settings.tooltip) {
                tooltip();
                rangeValueTooltip();
            }

            if ($().tab && settings.tab) {
                tab();
                if (settings.basil) {
                    restoreActiveTab();
                }
            }

            if ($().modal && settings.modal) {
                modalTogglerAttributs();
                //restoreActiveModal();
            }

            if ($().button && settings.switchButton) {
                watchSwitchButtons();
                if (typeof Basil === 'function' && settings.basil) {
                    storeSwitchButtonState();
                }
            }

        });

    };


    return {
        //debug: debug,
        //modalTogglerAttributs: modalTogglerAttributs,
        //restoreActiveTab: restoreActiveTab,
        //storeSwitchButtonState: storeSwitchButtonState,
        //tab: tab,
        //tooltip: tooltip,
        buildFileList: buildFileList,
        hideHashOnShown: hideHashOnShown,
        init: init,
        oneShownHiddenTab: oneShownHiddenTab,
        rangeValueTooltip: rangeValueTooltip,
        restoreActiveModal: restoreActiveModal,
        settings: settings
    };

})();
