module.exports = grammar({
  name: "hypr",

  extras: ($) => [/[ \t]/, $.comment],

  conflicts: ($) => [[$._value, $.gradient]],

  rules: {
    configuration: ($) =>
      repeat(
        choice(
          $.source,
          $.exec,
          $.assignment,
          $.command,
          $.section,
          $._linebreak
        )
      ),

    assignment: ($) => seq($.variable, "=", field("value", $._value)),

    command: ($) =>
      seq(
        choice($.name),
        "=",
        choice(seq(field("value", $._value), $._linebreak), $._linebreak)
      ),

    section: ($) =>
      seq(
        choice($.name, seq($.name, ":", field("device", $.name))),
        "{",
        $._linebreak,
        repeat(choice($.command, $.section)),
        "}",
        $._linebreak
      ),

    source: ($) => seq("source", "=", $.string),

    exec: ($) => seq(choice("exec", "exec-once"), "=", $.string),

    _value: ($) =>
      choice(
        $.boolean,
        $.number,
        $.vec2,
        $.color,
        $.gradient,
        $.mod,
        $.keys,
        $.string,
        $.variable,
        $.params
      ),

    boolean: () => choice("true", "false", "on", "off", "yes", "no"),

    number: () => seq(optional(choice("+", "-")), /[0-9][0-9\.]*/),

    vec2: ($) => seq($.number, $.number),

    color: ($) => choice($.legacy_hex, $.rgb),

    legacy_hex: ($) => seq("0x", $.hex),

    rgb: ($) => seq(choice("rgb", "rgba"), "(", $.hex, ")"),

    gradient: ($) => seq($.color, repeat($.color), optional($.angle)),

    hex: () => /[0-9a-fA-F]{6,8}/,

    angle: () => seq(/[0-9]{1,3}/, "deg"),

    mod: () =>
      choice(
        "SHIFT",
        "CAPS",
        "CTRL",
        "CONTROL",
        "ALT",
        "MOD2",
        "MOD3",
        "SUPER",
        "WIN",
        "LOGO",
        "MOD4",
        "MOD5",
        "TAB"
      ),

    keys: ($) => choice(seq($.mod, $.mod), seq($.variable, $.mod)),

    string: () => token(prec(-1, /[^\n,]+/)),

    params: ($) => prec.right(-1, seq($._value, repeat(seq(",", $._value)))),

    name: () => /[a-zA-Z][a-zA-Z0-9_\.\-]*/,

    variable: () => seq("$", /[a-zA-Z_][a-zA-Z0-9_]*/),

    _linebreak: () => "\n",

    comment: () => seq("#", /.*/),
  },
});