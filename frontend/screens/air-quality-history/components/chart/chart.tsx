import type {ReactElement} from 'react';
import React from 'react';
import {Text, View} from 'react-native';
import type {ChartProps} from './chart.types';
import {LineChart, lineDataItem} from 'react-native-gifted-charts';

export function Chart({...props}: ChartProps): ReactElement {
    const getChartFormattedData = (): lineDataItem[] => {
        const data = props.data;

        if (!data || !data.values || !data.labels || data.values.length === 0) {
            return [];
        }

        return data.values.map((value, index) => {
            const label = data.labels[index];

            return {
                value: value ?? undefined,
                label,
                dataPointText: `${value?.toFixed(0)}`,
                dataPointColor: 'orange',
                textColor: 'yellow',
                textShiftY: -10,
                textFontSize: 12,
                labelTextStyle: {color: 'yellow', fontSize: 10},
            };
        });
    };

    const getLeftSpacing = (): number => {
        switch (props.selectedTimePeriod) {
            case '1d':
                return 50;
            case '1w':
                return 25;
            case '1m':
                return 50;
            case '3m':
                return 50;
            case '6m':
                return 50;
            case '1y':
                return 75;
            default:
                throw new Error(`Unknown time period ${props.selectedTimePeriod} in getLeftSpacing`);

        }
    };

    const getPointsSpacing = (): number => {
        switch (props.selectedTimePeriod) {
            case '1d':
                return 125;
            case '1w':
                return 75;
            case '1m':
                return 150;
            case '3m':
                return 150;
            case '6m':
                return 150;
            case '1y':
                return 200;
            default:
                throw new Error(`Unknown time period ${props.selectedTimePeriod} in getPointsSpacing`);

        }
    };

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            width: 350,
        }}>
            <LineChart
                height={220}
                curved={true}
                adjustToWidth={true}
                showScrollIndicator={true}
                showVerticalLines={true}
                verticalLinesUptoDataPoint={true}
                isAnimated={true}
                renderDataPointsAfterAnimationEnds={true}
                scrollToEnd={true}
                nestedScrollEnabled={true}
                yAxisOffset={Number(Math.min(...props.data.values.filter((v): v is number => v !== undefined)).toFixed(0)) - 10}
                scrollAnimation={true}
                areaChart
                data={getChartFormattedData()}
                initialSpacing={getLeftSpacing()}
                spacing={getPointsSpacing()}
                color="yellow"
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
                xAxisColor="lightgray"
                showDataPointsForMissingValues={false}
                pointerConfig={{
                    pointerStripUptoDataPoint: true,
                    pointerStripColor: 'white',
                    pointerStripWidth: 1,
                    pointerColor: 'white',
                    hidePointerDataPointForMissingValues: true,
                    hidePointerForMissingValues: true,
                    radius: 6,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: true,
                    stripOverPointer: true,
                    pointerLabelComponent: (items: lineDataItem[]) => {
                        return (
                            <View
                                style={{
                                    height: 90,
                                    width: 120,
                                    justifyContent: 'center',
                                }}>


                                <View style={{paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: 'black'}}>
                                    <Text style={{color: 'yellow', fontSize: 12, marginBottom: 6, textAlign: 'center', fontWeight: 'bold', textDecorationLine: 'underline'}}>
                                        {items[0].label}
                                    </Text>
                                    <Text style={{color: 'yellow', fontSize: 12, marginBottom: 6, textAlign: 'center'}}>
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
