import { CommandContext } from '../models/command_context';
import { Command } from './command';
import axios from 'axios'
import { Convert, CovidData } from "../models/covid_data";
import { createChart } from "../helpers/chart_helper";
import { ChartData } from 'chart.js';
import { MessageEmbed } from 'discord.js';


export class CovidCasesCommand implements Command {
    commandNames = ['corona cases', ];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}covid to get the latest Covid-19 news and data.`;
    }

    async run(parsedUserCommand: CommandContext): Promise<void> {

        const parameters: string[] = parsedUserCommand.originalMessage.content.split(" ");
        var country: string = "";

        if (parameters[1] != null) {
            for (let index = 0; index < parameters.length; index++) {
                const element = parameters[index];

                if (index > 1) {
                    country = country + " " + element;
                }

            }
            country = country.trim()
            console.log(country);

        }


        const data = await getCovidData();

        if (data != null) {
            const keys = Object.keys(data)

            var countryCode = "OWID_WRL";

            if (country != null) {
                keys.forEach(code => {
                    if (data[code].location.toLowerCase() == country.toLowerCase()) {
                        countryCode = code
                    }
                });
            }

            var cases = data[countryCode].totalCases;

            if (cases == null || cases == 0) {
                await parsedUserCommand.originalMessage.reply('There\'s currently no data available from ' + country);
                return
            }
            const countryText = country == "" || countryCode == "OWID_WRL" ? "worldwide!" : " in " + country;
            await parsedUserCommand.originalMessage.reply('There are currently ' + cases + " cases of covid-19 " + countryText);

            
            var countries : string[] = []
            var totalCases : number[] = []


                keys.forEach(code => {
                    const loc = data[code]
                    if(loc.totalCasesPerMillion != null){
                        countries.push( loc.location)
                        totalCases.push(loc.totalCasesPerMillion)
                    }
                });
            

            const chartData : ChartData = {
                labels: countries,
                datasets: [{
                    label: "Total # of covid-19 cases per million",
                    data: totalCases
                }]
            }  

            const buffer = await createChart(25 * countries.length,1024, 'bar', chartData)
            const embed = new MessageEmbed()
            .setTitle('Covid-19 chart')
            .setDescription('Total # of covid-19 cases per million')
            .attachFiles([{name: "image.png", attachment:buffer}])
            .setImage('attachment://image.png');

            await parsedUserCommand.originalMessage.reply('', embed);


        }

        else {
            await parsedUserCommand.originalMessage.reply('I\'m sorry. There seems to be a problem with the server');
        }
    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}

async function getCovidData(): Promise<{ [key: string]: CovidData } | null> {
    var response = await axios.get('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/latest/owid-covid-latest.json');
    return Convert.toCovidData(JSON.stringify(response.data));
}

