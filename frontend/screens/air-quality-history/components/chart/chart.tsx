import type {ReactElement} from 'react';
import React from 'react';
import {Text, View} from 'react-native';
import type {ChartProps} from './chart.types';
import {LineChart, lineDataItem} from 'react-native-gifted-charts';
import {useSelectedLanguage} from '../../../../context/SelectedLanguageContext';
import {Language} from '../../../../utils/translations';

export function Chart({...props}: ChartProps): ReactElement {
    const {selectedLanguage} = useSelectedLanguage();
    const currentLanguage = (selectedLanguage || 'Eng') as Language;

    // Function to format numbers for Urdu if needed
    const formatNumberForLanguage = (value: number): string => {
        if (currentLanguage === 'اردو') {
            // Convert digits to Urdu
            return value.toFixed(0).replace(/[0-9]/g, (digit) => {
                const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                return digits[parseInt(digit)];
            }).replace('.', '٫'); // Replace decimal point with Urdu decimal separator
        }
        return value.toFixed(0);
    };

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
                labelTextStyle: {color: 'white', fontSize: 10},
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
                onlyPositive={true}
                dataPointsColor={'white'}
                height={200}
                adjustToWidth={true}
                showScrollIndicator={true}
                showVerticalLines={true}
                verticalLinesUptoDataPoint={true}
                verticalLinesColor={'black'}
                scrollToEnd={true}
                nestedScrollEnabled={true}
                // yAxisOffset={Math.max(Number(Math.min(...props.data.values.filter((v): v is number => v !== undefined)).toFixed(0)) - 10, 0)}
                scrollAnimation={true}
                areaChart
                data={getChartFormattedData()}
                initialSpacing={getLeftSpacing()}
                spacing={getPointsSpacing()}
                color="yellow"
                thickness={3}
                startFillColor="rgba(218,181,46,0.1)"
                endFillColor="rgba(218,181,46,0.1)"
                startOpacity={0.6}
                endOpacity={0.2}
                noOfSections={5}
                yAxisColor="white"
                yAxisThickness={0}
                rulesType="solid"
                rulesColor="gray"
                // Format Y-axis values based on language
                formatYLabel={(value) => formatNumberForLanguage(Number(value))}
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
                                    <Text style={{color: 'yellow', fontSize: 14, marginBottom: 6, textAlign: 'center'}}>
                                        {formatNumberForLanguage(items[0]?.value ?? 0)}
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
