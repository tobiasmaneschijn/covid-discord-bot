import { CommandContext } from '../models/command_context';
import { Command } from './command';
import axios from 'axios'
import { Convert, CovidData } from "../models/covid_data";

export class CovidInfoCommand implements Command {
    commandNames = ['corona info'];

    getHelpMessage(commandPrefix: string): string {
        return `Use ${commandPrefix}covid to get the latest Covid-19 news and data.`;
    }

    async run(parsedUserCommand: CommandContext): Promise<void> {

        // index 0 and 1 is the actual command
        const parameters: string[] = parsedUserCommand.originalMessage.content.split(" ");
        
        await parsedUserCommand.originalMessage.reply('This command is not implemented yet');
    }

    hasPermissionToRun(parsedUserCommand: CommandContext): boolean {
        return true;
    }
}



