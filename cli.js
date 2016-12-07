#!/usr/bin/env node

'use strict';
var html_packer = require('./index');
var yargs = require('yargs');
var fs = require('fs');

let argv = yargs
    .usage(`Usage: $0 [--compress] [--root cwd] in.html [out.html]`)
    .help()
    .boolean('compress')
    .alias('z', 'compress')
    .string('attribute')
    .default('attribute', 'inline')
    .string('root')
    .alias('d', 'root')
    .alias('h', 'help')
    .argv;

let source = argv._[0];


if (source === '-' || !source) {
    source = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        let chunk = process.stdin.read();
        if (chunk !== null) source += chunk;
    });
    process.stdin.on('end', () => {
        run(source, argv);
    });
}
else {
    run(source, argv);
}

function run(source, argv) {
    html_packer(source, {
        compress: argv.compress,
        rootpath: argv.root || argv.rootpath || process.cwd(),
        attribute: argv.attribute
    }, (err, html) => {
        if (err) {
            process.stderr.write(`Error: ${err}\n`);
            return process.exit(1);
        }

        let out = argv._[1];
        if (out) {
            fs.writeFile(out, html, err => {
                if (err) {
                    process.stderr.write(`Error: ${err}\n`);
                    return process.exit(1);
                }

                process.stderr.write(`Written to ${out}\n`);
                process.exit(0);
            });
        }
        else {
            process.stdout.write(html + '\n');
            process.exit(0);
        }
    });
}