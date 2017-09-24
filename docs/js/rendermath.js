;(function() {
    var originalKatexRender = katex.render
    katex.render = function() {
        var args = Array.prototype.slice.call(arguments)
        var options = args[2]
        if (typeof options !== 'object')
            options = args[2] = {}
        options.macros = {
            '\\asd': 'a + s + d',
            '\\V': '\\bf',
            '\\T': '\\bf',
            '\\hence': '\\quad\\Rightarrow\\quad',
            '\\compacthence': '\\ \\ \\Rightarrow\\ \\ '
        }
        originalKatexRender.apply(this, args)
    }

    $(document).ready(renderMathInElement.bind(
        this,
        document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
            ]
        }))
})()

