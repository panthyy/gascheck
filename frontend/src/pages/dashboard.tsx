import { useState, useEffect, useCallback } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const sensorTypes = [
  { id: "mq2", name: "MQ-2", fullName: "LPG, i-butane, propane, methane ,alcohol, hydrogen and smoke." },
  { id: "mq3", name: "MQ-3", fullName: "Alcohol, Benzine, CH4, Hexane, LPG, CO." },
  { id: "mq7", name: "MQ-7", fullName: "carbon monoxide" }
]
const generateMockData = () => {
  return Array.from({ length: 1 }, (_, i) => ({
    time: new Date(Date.now() - (1 - i - 1) * 60000).toISOString().substr(11, 8),
    ...Object.fromEntries(sensorTypes.map(sensor => [sensor.id, Math.random() * 100])),
  }))
}

type LevelUpdateMessage = {
    type: "level_update";
    payload: {
        mq2: number;
        mq3: number;
        mq7: number;
    }
    timestamp: number;
}

export default function GasSensorDashboard() {
  const [data, setData] = useState(generateMockData())
  const [currentLevels, setCurrentLevels] = useState<{ mq2: number; mq3: number; mq7: number; }>(
    { mq2: 0, mq3: 0, mq7: 0 }
    )


  const updateData = useCallback((newDataPoint:  LevelUpdateMessage) => {
    setData(prevData => {
      const newData = [...prevData, ...generateMockData()]
      setCurrentLevels(newDataPoint.payload)
      return newData
    })
  }, [])

  useEffect(() => {
    const eventSource = new EventSource("/sse");

    
    setInterval(() => {
        updateData( {
          type: "level_update",
          payload: {
            mq2: Math.random() * 100,
            mq3: Math.random() * 100,
            mq7: Math.random() * 100,
          },
          timestamp: Date.now(),
        })
    }, 3000);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateData(data);
    };
    return () => {
      eventSource.close();
    };
  }, [updateData]);



  const getStatusColor = (level: number) => {
    if (level < 30) return "bg-green-500"
    if (level < 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusText = (level: number) => {
    if (level < 30) return "Normal"
    if (level < 70) return "Warning"
    return "Critical"
  }

  return (
    <div className="p-8 bg-background">
      <h1 className="text-3xl font-bold mb-6">Gas Sensor Metrics Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {sensorTypes.map((sensor) => (
          <Card key={sensor.id} >
            <CardHeader className="pb-2">
              <CardTitle>{sensor.name} Sensor</CardTitle>
              <CardDescription className="h-12">{sensor.fullName} level</CardDescription>
            </CardHeader>
            <CardContent >
              <div className="flex items-center justify-between mt-auto">
                <div className="text-4xl font-bold">{currentLevels[sensor.id].toFixed(1)}</div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(currentLevels[sensor.id])}`} />
                  <span className="text-sm font-medium">
                    {getStatusText(currentLevels[sensor.id])}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gas Concentration Over Time</CardTitle>
          <CardDescription>Real-time monitoring of gas levels for all sensors</CardDescription>
        </CardHeader>
        <CardContent>
        <ChartContainer
            config={Object.fromEntries(
              sensorTypes.map((sensor, index) => [
                sensor.id,
                {
                  label: sensor.name,
                  color: `hsl(var(--chart-${index + 1}))`,
                }
              ])
            )}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {sensorTypes.map((sensor) => (
                  <Line
                    key={sensor.id}
                    type="monotone"
                    dataKey={sensor.id}
                    stroke={`var(--color-${sensor.id})`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}