;(function() {
    if (typeof Storage !== 'undefined') {
        var clockData = localStorage.getItem('clockData')
        if (!clockData) {
            clockData = JSON.stringify({
                totalMinutes: 15,
                startTime: Date.now()
            })
            localStorage.setItem('clockData', clockData)
        }
        clockData = JSON.parse(clockData)
        $(document).ready(function() {
            var clockSize = 120
            var canvas = $('<canvas>').attr('height', clockSize).attr('width', clockSize)
            var clock = ($('<div>').addClass('clock').append(canvas)).appendTo($('body'))

            var clockCtl = $('<div>').addClass('clock-ctl').appendTo(clock)
            var clockCtlBody = $('<div>').appendTo(clockCtl)

            var uiTotalMinutes = $('<input>')
                .attr('type', 'number')
                .attr('min', '0')
                .attr('max', '60')
                .appendTo(clockCtlBody)
            var uiClockStart = $('<input>').attr('type', 'button').appendTo(clockCtlBody)

            clock
                .hover(function() {
                    clockCtl.show('fast', function() {
                        uiTotalMinutes.val(clockData.totalMinutes).focus().select()
                    })
                },
                function() {
                    clockCtl.hide('fast')
                })

            uiClockStart.click(function() {
                clockData = {
                    totalMinutes: +uiTotalMinutes.val(),
                    startTime: Date.now()
                }
                localStorage.setItem('clockData', JSON.stringify(clockData))
                clockCtl.hide('fast')
            })

            uiTotalMinutes.keypress(function(e) {
                if (e.keyCode === 13)
                    uiClockStart.click()
            })

            function paintClock() {
                if (!canvas[0].getContext)
                    return
                var centerX = 0.5*clockSize
                var centerY = 0.5*clockSize
                var relRadius = 0.45
                var radius = relRadius*clockSize
                var ctx = canvas[0].getContext('2d')

                ctx.clearRect(0, 0, clockSize, clockSize)

                ctx.lineWidth = 2
                ctx.fillStyle = '#eee'
                ctx.strokeStyle = '#aaa'
                ctx.lineCap='butt'

                ctx.beginPath()
                ctx.arc(centerX, centerY, radius, 0, 2*Math.PI)
                ctx.fill()
                ctx.stroke()

                function drawClockHand(r1, r2, lineWidth, strokeStyle, minutes) {
                    ctx.lineWidth = lineWidth
                    ctx.strokeStyle = strokeStyle
                    ctx.beginPath()
                    var angle = minutes*Math.PI/30
                    var sx = Math.sin(angle)
                    var sy = Math.cos(angle)
                    var R1 = r1*clockSize
                    var R2 = r2*clockSize
                    ctx.moveTo(centerX+R1*sx, centerY-R1*sy)
                    ctx.lineTo(centerX+R2*sx, centerY-R2*sy)
                    ctx.stroke()
                }

                // Draw clock hands
                var date = new Date()
                var msec = date.getMilliseconds()
                var sec = date.getSeconds() + msec / 1000
                var min = date.getMinutes() + sec / 60
                var hr = date.getHours() + min / 60
                var endTimeMsec = clockData.startTime + clockData.totalMinutes*60000
                var endDate = new Date(endTimeMsec)
                var endMinutes = endDate.getMinutes() + endDate.getSeconds()/60

                var r1 = 0.28

                ctx.lineCap='butt'
                ctx.lineWidth = radius - r1*clockSize
                ctx.strokeStyle = '#ff0'
                ;(function() {

                    // https://gist.github.com/mjackson/5311256
                    /**
                     * Converts an HSV color value to RGB. Conversion formula
                     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
                     * Assumes h, s, and v are contained in the set [0, 1] and
                     * returns r, g, and b in the set [0, 255].
                     *
                     * @param   Number  h       The hue
                     * @param   Number  s       The saturation
                     * @param   Number  v       The value
                     * @return  Array           The RGB representation
                     */
                    function hsvToRgb(h, s, v) {
                      var r, g, b;

                      var i = Math.floor(h * 6);
                      var f = h * 6 - i;
                      var p = v * (1 - s);
                      var q = v * (1 - f * s);
                      var t = v * (1 - (1 - f) * s);

                      switch (i % 6) {
                        case 0: r = v; g = t; b = p; break;
                        case 1: r = q; g = v; b = p; break;
                        case 2: r = p; g = v; b = t; break;
                        case 3: r = p; g = q; b = v; break;
                        case 4: r = t; g = p; b = v; break;
                        case 5: r = v; g = p; b = q; break;
                      }

                      return [ Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255) ];
                    }

                    var mend = endDate.valueOf()/60000
                    var m = date.valueOf()/60000
                    var nf = mend - m
                    if (nf <= 0)
                        return
                    n = 3*Math.ceil(nf)
                    var h = nf / n
                    ctx.beginPath()
                    for (var i=0; i<n; ++i, m+=h) {
                        var p = (mend - m) / clockData.totalMinutes
                        drawClockHand(r1, relRadius, 2*clockSize/120, 'rgb(' + hsvToRgb(p/3, 0.5, 1).join(',') + ')', m)
                    }
                    ctx.stroke()
                })()

                // Draw clock ticks
                ;(function() {
                    for (var i=0; i<60; ++i) {
                        var w, r1
                        if (i % 5) {
                            w = 1
                            r1 = 0.43
                        }
                        else {
                            w = 3
                            r1 = i % 15? 0.43 :   0.42
                        }
                        drawClockHand(r1, relRadius, w, '#888', i)
                    }
                })()

                ctx.lineCap='round'
                drawClockHand(r1, 0.35, 4, '#666', hr * 5)
                drawClockHand(r1, 0.4, 2, '#888', min)
                drawClockHand(r1, relRadius, 1, '#ccc', sec)

                ctx.fillStyle = '#fff'
                ctx.beginPath()
                ctx.arc(centerX, centerY, r1*clockSize, 0, 2*Math.PI)
                ctx.fill()

                var secondsLasting = Math.floor((date.valueOf() - clockData.startTime) / 1000)
                if (secondsLasting/60 < 100) {
                    function twodigits(x) {
                        var result = x.toString()
                        if (result.length === 1)
                            result = '0' + result
                        return result
                    }
                    sec = twodigits(secondsLasting % 60)
                    min = twodigits(Math.floor(secondsLasting / 60))
                    ctx.fillStyle = '#fff'
                    // roundedRect(0.25*clockSize, 0.42*clockSize, 0.5*clockSize, 0.17*clockSize, 3)
                    ctx.font = Math.round(16*clockSize/100).toString() + 'px courier'
                    ctx.textAlign = 'center'
                    var minutesRemaining = clockData.totalMinutes - secondsLasting/60
                    ctx.fillStyle = minutesRemaining > 5 ?    '#24217f' : minutesRemaining > 3 ? '#c60' : minutesRemaining > 0 ? '#c00' : '#000'
                    ctx.fillText('' + min + ':' + sec, 0.5*clockSize, 0.55*clockSize)
                }
            }
            setInterval(paintClock, 200)
        })
    }
})()
