import type {ReactElement} from 'react';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import type {PollutantInfoCardProps} from './pollutant-info-card.types';
import {styles} from './pollutant-info-card.styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const UNITS = 'µg/m³';

export function PollutantInfoCard({...props}: PollutantInfoCardProps): ReactElement {
    return (
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#40320A',
            height: 95,
            paddingHorizontal: 12,
            paddingVertical: 14,
            borderRadius: 8,
        }}>
            <View>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                }}>
                    <Text style={{color: 'yellow', fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>{props.pollutantName}</Text>
                    <Text style={{color: 'yellow', fontWeight: 'bold', fontSize: 20, lineHeight: 20}}>{props.pollutantValue}</Text>
                </View>

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                }}>
                    <Text style={{color: 'yellow', fontSize: 15, lineHeight: 20, fontWeight: '300'}}>{props.pollutantDescription}</Text>
                    <Text style={{color: 'yellow', fontSize: 15, lineHeight: 20, fontWeight: '300'}}>{UNITS}</Text>
                </View>
            </View>

            <TouchableOpacity activeOpacity={0.8}>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: 6,
                    // padding: 8,
                }}>
                    <Icon name="line-chart" size={15} color="yellow" style={{
                        marginRight: 8,
                    }}/>
                    <Text style={{color: 'yellow', fontSize: 15, lineHeight: 15}}>View History</Text>
                </View>
            </TouchableOpacity>

        </View>
    );
}
