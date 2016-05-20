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

    var settings = {
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
        }
    };



    /**
     * Save / restore the last displayed tab  using local storage
     * Usage: tabModule.rememberTab('#main-nav', !localStorage);
     * Tab links must contain a data-toggle attribut
     * @public
     * @param {string} linksSelector - Tab links selector
     * @param {boolean} useHash - Restore tab from URL hash or the transparent localStorage method ?
     */
    var restoreActiveTab = function () {

        if (typeof Basil !== 'undefined' && typeof ($.fn.tab) !== 'undefined') {

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

        } else {
            console.warn('Bootstrap tab plugin is not loaded');
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

            // Restore the last active modal
            if (settings.storeActive) {
                //restoreActiveTab();
            }

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

                if (data.targetSection) {
                    var $sections = $modal.find('[data-section]');
                    console.log('Targeted section', data.targetSection);
                    var $section;
                    if ($sections) {
                        $sections.each(function () {
                            $section = $(this);
                            if ($section.data('section') === data.targetSection) {
                                $section.show();
                                console.log('Show section', $section.data('section'));
                            } else {
                                $section.hide();
                                console.log('Hide section', $section.data('section'));
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
     * @param {String} selector - Container for the list
     */
    var inputFileList = function (files, selector) {

        var $container = $(selector);

        if (!$container || !files) {
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

        $container.html('<ul class="list-group">' + listItems.join('') + '</ul>');

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

        var $input = $('input[type="range"]');
        if ($input) {

            // Initially define the tooltip title with the default value
            $input.attr('data-original-title', $input.val());

            // Watch changes, update the title and show up the tooltip
            $input.on('input', function () {
                $input.attr('data-original-title', $input.val()).tooltip('show');
            });

            // Show the tooltip when user focus the field
            $input.on('focus', function () {
                $input.tooltip('show');
            });
        }

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

        if ($().tab) {
            var $tabs = $(settings.tab.toggleSelector);
            $tabs.on('shown.bs.tab', function (e) {
                var paneId = $(e.target).attr('href');
                console.log('Tab shown', paneId);
            });
        }

        if ($().modal) {
            var $modals = $(settings.modal.modalSelector);
            $modals.on('shown.bs.modal', function (e) {
                var modalId = '#' + e.target.id;
                console.log('Modal shown', modalId);
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
     * Data persistence inputs
     * @public
     */
    var storeButtonState = function () {

        if (typeof Basil === 'undefined') {
            return false;
        }

        var basil = new window.Basil(settings.basil);

        var $button, $buttons, value, id;

        $('.btn').filter('[id]').each(function () {
            $button = $(this);

            // Store changes
            $button.on('click', function () {

                // If the button is in a button group, reset all stored values
                $buttons = $(this).parent('.btn-group').find('.btn').filter('[id]');
                console.log('Button group length', $buttons.length);
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
     * Document ready
     */
    $(function () {



    });


    return {
        debug: debug,
        inputFileList: inputFileList,
        modalTogglerAttributs: modalTogglerAttributs,
        tab: tab,
        oneShownHiddenTab: oneShownHiddenTab,
        rangeValueTooltip: rangeValueTooltip,
        settings: settings,
        restoreActiveTab: restoreActiveTab,
        restoreActiveModal: restoreActiveModal,
        storeButtonState: storeButtonState,
        tooltip: tooltip,
        hideHashOnShown: hideHashOnShown
    };

})();
