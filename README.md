![Maintained][maintained-badge]
[![Travis Build Status][build-badge]][build]
[![Make a pull request][prs-badge]][prs]
[![License](http://img.shields.io/badge/Licence-MIT-brightgreen.svg)](LICENSE.md)


# Covid tracker for Discord

A bot that shares information and news about Covid-19

## Configuration

After cloning the repository run `npm install`.

Add your discord bot token to a file `.env` in the root directory:

```
BOT_TOKEN=TOKEN_HERE
```

Note that changes to this file should not be committed to the repository, `.env` is part of the .gitignore to prevent this.

## Key Commands

| Command          | Description                            |
| ---------------- | -------------------------------------- |
| `npm run start`  | Run the bot.                           |
| `npm run build`  | Build the typescript code.             |
| `npm run lint`   | Runs the linter on the code.           |
| `npm run format` | Fixes most lint errors using Prettier. |
| `npm run test`   | Run all tests.                         |


[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[maintained-badge]: https://img.shields.io/badge/maintained-yes-brightgreen
