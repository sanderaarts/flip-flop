'use strict';

const fs = require('fs');
const weekNumber = require('weeknumber').weekNumber;
const chalk = require('chalk');
const trophyFile = process.argv[2];

if (!trophyFile) {
    throw new Error('No trophy file was passed!');
}

fs.readFile(trophyFile, 'utf8', (error, data) => {
    if (error) {
        throw error;
    }

    const rowSplit = /\n+/m;
    const validResult = /^\d+\s+[a-zA-Z]+/;
    const parseResult = /^(\d+)\s+([^*]+)(\*?)/;
    let lastWeekPlayed = 0;
    const winners = data.split(rowSplit)
        .filter(row => validResult.test(row))
        .map(row => {
            const match = parseResult.exec(row);
            const week = parseInt(match[1], 10);

            lastWeekPlayed = Math.max(week, lastWeekPlayed);
            return {
                weekNr: week,
                name: match[2].trim(),
                isLuckyBastard: !!match[3]
            };
        });
    const today = new Date();
    const currentWeek = weekNumber(today);
    // Check week number on Dec 28 for total weeks in year
    const totalWeeks = weekNumber(new Date(today.getFullYear(), 11, 28));
    const weeksLeft = totalWeeks - (lastWeekPlayed < currentWeek ? currentWeek - 1 : currentWeek);
    const results = finalizeResults(winners.reduce(collectResults, {}), weeksLeft);

    console.log(createOverview(results));
});

function collectResults(results, win) {
    const player = win.name;

    if (!(player in results)) {
        results[player] = {
            name: player,
            weeks: [win.weekNr],
            stars: win.isLuckyBastard ? 1 : 0
        };
    } else {
        const result = results[player];

        result.weeks.push(win.weekNr);
        if (win.isLuckyBastard) {
            result.stars += 1;
        }
    }
    return results;
}

function finalizeResults(results, weeksLeft) {
    let topScore = 0;

    return Object.keys(results)
        .map(winner => {
            const result = results[winner];

            result.score = result.weeks.length;
            topScore = Math.max(result.score, topScore);
            return result;
        })
        .map(result => {
            result.isStillInTheRace = result.score + weeksLeft >= topScore;
            return result;
        })
        .sort(sortByScoreDesc);
}

function sortByScoreDesc(playerA, playerB) {
    return playerB.score === playerA.score ? playerA.stars - playerB.stars : playerB.score - playerA.score;
}

function createOverview(results) {
    return results.reduce((list, player) => {
        list += chalk.bold.yellow(player.score) + getStars(player.stars) + '\t' + (player.isStillInTheRace ? chalk.green(player.name) : chalk.red(player.name)) + '\n\r';
        return list;
    }, '\n');
}

function getStars(count) {
    let stars = '';

    while (count > 0) {
        stars += '*';
        count -= 1;
    }
    return stars ? chalk.gray(stars) : '';
}