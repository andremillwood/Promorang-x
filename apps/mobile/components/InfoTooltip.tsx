import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';

interface InfoTooltipProps {
    content: string;
    children?: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
    content,
    children,
    placement = 'top',
}) => {
    const [visible, setVisible] = React.useState(false);

    return (
        <Tooltip
            isVisible={visible}
            content={
                <View style={styles.tooltipContent}>
                    <Text style={styles.tooltipText}>{content}</Text>
                </View>
            }
            placement={placement}
            onClose={() => setVisible(false)}
            backgroundColor="rgba(0, 0, 0, 0.5)"
            contentStyle={styles.tooltipContainer}
        >
            <TouchableOpacity
                onPress={() => setVisible(true)}
                style={styles.iconButton}
                activeOpacity={0.7}
            >
                {children || (
                    <View style={styles.helpIcon}>
                        <Text style={styles.helpIconText}>?</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Tooltip>
    );
};

const styles = StyleSheet.create({
    iconButton: {
        marginLeft: 8,
    },
    helpIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#6B7280',
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpIconText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    tooltipContainer: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 12,
        maxWidth: 250,
    },
    tooltipContent: {
        padding: 4,
    },
    tooltipText: {
        color: '#FFFFFF',
        fontSize: 13,
        lineHeight: 18,
    },
});
