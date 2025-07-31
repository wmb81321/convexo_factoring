"use client";

import React from "react";
import SwapWidgetComponent from "@/app/components/swap-widget";

export default function Swap() {
  return (
    <div className="space-y-6">
      <SwapWidgetComponent 
        defaultInputToken="NATIVE"
        defaultOutputToken="0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219"
        onSwapComplete={(txHash) => {
          console.log('Swap completed:', txHash);
          // You can add additional logic here like showing notifications
        }}
      />
    </div>
  );
} 