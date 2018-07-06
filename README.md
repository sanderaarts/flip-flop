# flip-flop

Read Flip-Flop pinball trophy file and print the ranks.

## Install

```sh
git clone https://github.com/sanderaarts/flip-flop.git
cd flip-flop
npm install
npm link
```

## Use

Use on command line, for instance:

```sh
flip-flop \<trophyFilePath>
```

### Trophy file format

Each row:

\<weekNumber> \<whitespace> \<playerName> [ [ \<whitespace> ] * [ \<any> ] ]