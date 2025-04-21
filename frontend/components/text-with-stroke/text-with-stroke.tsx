import React from 'react';
import {Text, View, StyleSheet, TextStyle} from 'react-native';

interface OutlinedTextProps {
    text: string;
    size?: number;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    lineHeight?: number;
    bold?: boolean;
    style?: TextStyle;
}

const TextWithStroke: React.FC<OutlinedTextProps> = ({
                                                         text,
                                                         size = 24,
                                                         color = '#FFFFFF',
                                                         strokeColor = '#000000',
                                                         strokeWidth = 1,
                                                         lineHeight,
                                                         bold = false,
                                                         style,
                                                     }) => {
    const layers = [
        {dx: -strokeWidth, dy: -strokeWidth},
        {dx: strokeWidth, dy: -strokeWidth},
        {dx: -strokeWidth, dy: strokeWidth},
        {dx: strokeWidth, dy: strokeWidth},
        {dx: -strokeWidth, dy: 0},
        {dx: strokeWidth, dy: 0},
        {dx: 0, dy: -strokeWidth},
        {dx: 0, dy: strokeWidth},
    ];

    const textStyle: TextStyle = {
        fontSize: size,
        lineHeight: lineHeight ?? size * 1.2,
        color,
        textAlign: 'center',
        fontWeight: bold ? 'bold' : 'normal',
        ...style,
    };

    return (
        <View style={styles.container}>
            {layers.map((offset, index) => (
                <Text
                    key={index}
                    style={[
                        textStyle,
                        {
                            position: 'absolute',
                            left: offset.dx,
                            top: offset.dy,
                            color: strokeColor,
                        },
                    ]}
                >
                    {text}
                </Text>
            ))}
            <Text style={[textStyle, {zIndex: 1}]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
});

export default TextWithStroke;
