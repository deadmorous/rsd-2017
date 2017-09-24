;(function() {
    function callMethod(object, names) {
        for(var i=0; i<names.length; ++i) {
            var f = object[names[i]]
            if (f instanceof Function) {
                f.call(object)
                return
            }
        }
        console.log('WARNING: None of the following methods is found: ' + names.join(', '))
    }

    function requestFullScreen(element) {
        callMethod(element, ['requestFullScreen', 'webkitRequestFullScreen', 'mozRequestFullScreen'])
    }
    function cancelFullScreen() {
        callMethod(document, ['cancelFullScreen', 'webkitCancelFullScreen', 'mozCancelFullScreen'])
    }

    var isMobile = navigator.userAgent.toLowerCase().search( /(iphone)|(ipod)|(android)/ ) !== -1

    // Add slide numbers
    $('.step').each(function() {
        var step = $(this)
        var stepNumber = +step.attr('step') + 1
        if (stepNumber > 1)
            $('<div>').addClass('slide-number').text(stepNumber).appendTo(step)
        if (isMobile && step.css('position') !== 'absolute')
            step.css('position', 'relative')
    })

    $('#impress')
        .on('impress:stepleave', function(e) {
            // Stop videos in this slide
            $(e.target).find('video').each(function() { this.pause() })
            cancelFullScreen()

            // Close zoomed images, if any
            $.fancybox.close(true)
        })


    if (isMobile) {

    }
    else {
        // Add some keyboard navigation on desktop systems
        function toggleVideoPlayback() {
            var v = $('.active video')
            if (v.length === 0)
                return
            v = v[0]
            if (v.paused) {
                requestFullScreen(v)
                v.play()
            }
            else {
                v.pause()
                cancelFullScreen()
                }
            }

        function keyPressed(e) {
            if (typeof e.key === 'string')
                return e.key.toLowerCase()
            else {
                // Google Chrome 50.0.2661.86 (64-bit), linux: e.key is undefined
                return String.fromCharCode(e.charCode).toLowerCase()
            }
        }

        $(document).keypress(function(e) {
            // console.log('Pressed ' + e.keyCode)
            if (e.keyCode === 18)
                altPressed = true
            switch (keyPressed(e)) {
                case 'v':
                    toggleVideoPlayback()
                    break
            }
        })
        $(document).keyup(function(e) {
            // console.log(e.keyCode)
            switch (e.keyCode) {
                case 36:    // home
                    impress().goto(0)
                    break
                case 27:    // Esc
                    $.fancybox.close()
                    break
                case 66:    // b
                    window.history.back()
                    break
                case 70:    // f
                    window.history.forward()
                    break
                case 37:    // Left arrow
                    if (e.altKey)
                        window.history.back()
                    break
                case 39:    // Left arrow
                    if (e.altKey)
                        window.history.forward()
                    break
            }
        })

        function addHovercraftHelp(param) {
            var hht = $('#hovercraft-help tbody')
            if (!(param instanceof Array))
                param = [param]
            for (var i=0; i<param.length; ++i) {
                var p = param[i]
                hht
                    .append( $('<tr>')
                        .append($('<th>').text(p.key))
                        .append($('<td>').text(p.info)) )
            }
        }
        addHovercraftHelp([
            {key: 'V', info: 'Toggle video playback'},
            {key: 'Home', info: 'Goto first slide'}
        ])
    }

    // Add classes for fancybox to zoom images on click
    $('img').each(function() {
        var j = $(this)
        var src = j.attr('src')
        var a = $('<a>').attr('href', src).attr('data-fancybox','gallery')
        j.wrap(a)
    })
    var fancyBoxOptions = {
        infobar: false,
        buttons: false,
        focus: false
    }

    // if (isMobile)
        $.extend(fancyBoxOptions, {
            keyboard: false,
            buttons: true,
            slideShow: false,
            fullScreen: false,
            thumbs: false,
            closeBtn: true
        })

    $("[data-fancybox]").fancybox(fancyBoxOptions)

    $(document).ready(function() {
        $('.almost-invisible').parent('li').addClass('almost-invisible')
    })
})()

