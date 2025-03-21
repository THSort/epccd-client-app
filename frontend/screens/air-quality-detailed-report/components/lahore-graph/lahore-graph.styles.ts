import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        height: 250,
        width: '100%',
        marginVertical: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    // New container that includes both map and legend
    containerWithLegend: {
        width: '100%',
        marginVertical: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    // Map container with fixed height
    mapContainer: {
        height: 220,
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: 'hidden',
    },
    mapView: {
        flex: 1,
    },
    // Legend below map styles
    belowMapLegend: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        paddingVertical: 8,
        paddingHorizontal: 5,
        flexDirection: 'column',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    legendBelowRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginVertical: 2,
        flexWrap: 'wrap',
    },
    legendBelowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 3,
        marginVertical: 2,
        minWidth: 50,
    },
    legendBelowDot: {
        width: 12,
        height: 12,
        borderRadius: 10,
        marginRight: 3,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    legendBelowText: {
        fontSize: 10,
        color: 'white',
        fontWeight: '500',
        flexShrink: 1,
    },
    // New permanent marker styles
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 140,
    },
    labelBubble: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
        marginBottom: 2,
    },
    labelTitle: {
        color: '#333',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    aqiBubble: {
        alignSelf: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    aqiValue: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    markerTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white',
        transform: [{ rotate: '180deg' }],
    },
    markerPin: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'white',
    },
    // Custom marker styles
    markerWithLabelContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 130,
    },
    customMarkerContainer: {
        alignItems: 'center',
        width: 120,
    },
    // Label container for text above pins
    labelContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 130,
        backgroundColor: 'transparent',
        marginBottom: 5,
    },
    pinPoint: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
        transform: [{
            rotate: '45deg',
        }],
    },
    locationLabel: {
        color: 'black',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    aqiBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'white',
        marginTop: 4,
    },
    aqiBadgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    // Old styles - keep for reference
    markerWrapper: {
        alignItems: 'center',
        width: 90,
    },
    markerText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        minWidth: 120,
    },
    locationNameText: {
        width: 90,
        color: 'black',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
    },
    // Callout styles
    calloutContainer: {
        width: 120,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    calloutText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    aqiContainer: {
        alignSelf: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
    },
    aqiText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    legend: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 5,
        padding: 5,
        paddingVertical: 10,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 5,
    },
    legendText: {
        fontSize: 10,
        color: '#333',
    },
    newLegend: {
        position: 'absolute',
        bottom: 5,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 20,
        padding: 8,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        maxWidth: '96%',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 7,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    legendItemText: {
        fontSize: 11,
        color: 'white',
        fontWeight: '500',
    },
    // Fixed legend styles for the black background legend at the bottom
    fixedLegend: {
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    fixedLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 3,
        marginVertical: 2,
        minWidth: 50,
    },
    fixedLegendDot: {
        width: 12,
        height: 12,
        borderRadius: 10,
        marginRight: 3,
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    fixedLegendText: {
        fontSize: 10,
        color: 'white',
        fontWeight: '500',
        flexShrink: 1,
    },
    // Two-row legend styles for showing all categories
    twoRowLegend: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        paddingTop: 6,
        paddingBottom: 8,
        paddingHorizontal: 5,
        flexDirection: 'column',
    },
    twoRowLegendRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginVertical: 3,
        flexWrap: 'wrap',
        paddingHorizontal: 2,
    },
});
