import type {ReactElement} from 'react';
import React from 'react';
import {Text, View} from 'react-native';
import type {ChartProps} from './chart.types';
import {styles} from './chart.styles';
import {LineChart, lineDataItem, Pointer, yAxisSides} from 'react-native-gifted-charts';

export function Chart({...props}: ChartProps): ReactElement {
    const ptData = [
        {value: 0, date: '1 Apr 2022'},
        {value: 180, date: '2 Apr 2022'},
        {value: 190, date: '3 Apr 2022'},
        {value: 180, date: '4 Apr 2022'},
        {value: 140, date: '5 Apr 2022'},
        {value: 145, date: '6 Apr 2022'},
        {value: 160, date: '7 Apr 2022'},
        {value: 200, date: '8 Apr 2022'},

        {value: 220, date: '9 Apr 2022'},
        {
            value: undefined,
            date: '10 Apr 2022',
            label: '10 Apr',
            labelTextStyle: {color: 'lightgray', width: 60},
        },
        {value: 280, date: '11 Apr 2022'},
        {value: 260, date: '12 Apr 2022'},
        {value: 340, date: '13 Apr 2022'},
        {value: 385, date: '14 Apr 2022'},
        {value: 280, date: '15 Apr 2022'},
        {value: 390, date: '16 Apr 2022'},

        {value: 370, date: '17 Apr 2022'},
        {value: 285, date: '18 Apr 2022'},
        {value: 295, date: '19 Apr 2022'},
        {
            value: 300,
            date: '20 Apr 2022',
            label: '20 Apr',
            labelTextStyle: {color: 'lightgray', width: 60},
        },
        {value: 280, date: '21 Apr 2022'},
        {value: 295, date: '22 Apr 2022'},
        {value: 260, date: '23 Apr 2022'},
        {value: 255, date: '24 Apr 2022'},

        {value: 190, date: '25 Apr 2022'},
        {value: 220, date: '26 Apr 2022'},
        {value: 205, date: '27 Apr 2022'},
        {value: 230, date: '28 Apr 2022'},
        {value: 210, date: '29 Apr 2022'},
        {
            value: 200,
            date: '30 Apr 2022',
            label: '30 Apr',
            labelTextStyle: {color: 'lightgray', width: 60},
        },
        {value: 240, date: '1 May 2022'},
        {value: 250, date: '2 May 2022'},
        {value: 280, date: '3 May 2022'},
        {value: 250, date: '4 May 2022'},
        {value: 210, date: '5 May 2022'},
    ];

    const getChartFormattedData = (): lineDataItem[] => {
        const data = props.data;

        if (!data || !data.values || !data.labels || data.values.length === 0) {
            return [];
        }

        return data.values.map((value, index) => {
            const label = data.labels[index];

            return {
                value,
                label,
                dataPointText: '', // Empty string to not show any text on data points
                labelTextStyle: {color: 'lightgray', fontSize: 10},
            };
        });
    };


    return (
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <LineChart
                // interpolateMissingValues={false}
                // @ts-ignore
                yAxisOffset={(Math.min(...props.data.values).toFixed(0) - 5)}
                scrollAnimation={true}
                areaChart
                data={getChartFormattedData()}
                width={300}
                hideDataPoints
                initialSpacing={50}
                spacing={100}
                color="#00ff83"
                thickness={4}
                startFillColor="rgba(20,105,81,0.3)"
                endFillColor="rgba(20,85,81,0.01)"
                startOpacity={0.9}
                endOpacity={0.2}
                noOfSections={6}
                yAxisColor="white"
                yAxisThickness={0}
                rulesType="solid"
                rulesColor="gray"
                yAxisTextStyle={{color: 'white'}}
                // yAxisSide={yAxisSides.RIGHT}
                xAxisColor="lightgray"
                pointerConfig={{
                    pointerStripHeight: 160,
                    pointerStripColor: 'lightgray',
                    pointerStripWidth: 2,
                    pointerColor: 'lightgray',
                    radius: 6,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: false,
                    pointerLabelComponent: (items: lineDataItem[]) => {
                        return (
                            <View
                                style={{
                                    height: 90,
                                    width: 120,
                                    justifyContent: 'center',
                                    marginTop: -10,
                                    marginLeft: -40,
                                }}>


                                <View style={{paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: 'white'}}>
                                    <Text style={{color: 'red', fontSize: 14, marginBottom: 6, textAlign: 'center'}}>
                                        {items[0].label}
                                    </Text>
                                    <Text style={{color: 'red', fontSize: 14, marginBottom: 6, textAlign: 'center'}}>
                                        {(items[0]?.value ?? 0).toFixed(1)}
                                    </Text>
                                </View>
                            </View>
                        );
                    },
                }}

            />
        </View>
    );


}
