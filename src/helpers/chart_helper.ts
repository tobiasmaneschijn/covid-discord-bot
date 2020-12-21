
import { ChartConfiguration, ChartData, ChartType } from "chart.js";
import { ChartCallback, CanvasRenderService } from "chartjs-node-canvas";


  
export async function createChart (width: number, height: number, chartType : ChartType, data : ChartData) : Promise<Buffer>{
    const canvasRenderService = new CanvasRenderService(width, height, (ChartJS) => { 
        ChartJS.plugins.register({
            beforeDraw: (chartInstance) => {
              chartInstance
              const { ctx } = chartInstance
              if(ctx == null || chartInstance.width == null || chartInstance.height == null)
              return; 
              ctx.fillStyle = 'white'
              ctx.strokeStyle = 'black'
              ctx.fillRect(0, 0, chartInstance.width, chartInstance.height)
            },
          })
    });

    
    const configuration : ChartConfiguration = {
        type: chartType,
        data: data,
        options: {

        }
    };

    const buf = await canvasRenderService.renderToBuffer(configuration)
    return  buf;
}