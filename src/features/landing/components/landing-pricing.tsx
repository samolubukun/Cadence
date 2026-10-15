export function LandingPricing() {
  const rows = [
    { feature:"Storage",       cadence:"Private Cloudflare R2 - your bucket, your keys", others:"Vendor-managed; terms can change" },
    { feature:"Compute",       cadence:"Scale-to-zero serverless NVIDIA A10G",            others:"24/7 dedicated inference servers" },
    { feature:"Pricing model", cadence:"Pay-as-you-go credit pool across all studio modes", others:"Opaque subscriptions + overage penalties" },
    { feature:"Voice & Music", cadence:"Zero-shot cloning + multi-track music & stems",  others:"Fragmented separate subscriptions" },
    { feature:"Media Studio",  cadence:"SDXL & Wan2.1 visualizers included in one hub",   others:"Separate third-party API keys" },
    { feature:"Transcription", cadence:"Whisper large-v3 - word timestamps + SRT",        others:"Proprietary model - JSON only" },
    { feature:"Data privacy",  cadence:"Audio & media never leave your R2 bucket",        others:"Sent to vendor APIs for inference" },
    { feature:"Idle cost",     cadence:"$0.00 when not in use",                           others:"Full monthly fee regardless of usage" },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#f6f8fa] border-y border-[#e4e7ec]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[7px] bg-[#ffffff] border border-[#e4e7ec] text-[12px] font-medium text-[#6f7988] shadow-[0_1px_2px_rgba(28,40,64,0.04)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#266df0]" />
            Transparent Pricing
          </div>
          <h2 style={{ fontSize:"clamp(1.8rem,3.2vw,2.5rem)", fontWeight:600, color:"#1c1d1f", letterSpacing:"-0.03em", lineHeight:1.15 }}>
            Cadence vs. Legacy Cloud APIs
          </h2>
          <p className="text-[15px] text-[#6f7988] leading-relaxed max-w-xl mx-auto font-normal">
            No mystery subscriptions. No vendor lock-in. Voice, music, stems, and visual media powered by predictable pay-as-you-go credits.
          </p>
        </div>

        <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[560px] bg-[#ffffff] border border-[#e4e7ec] rounded-[14px] overflow-hidden shadow-[rgba(28,40,64,0.06)_0px_4px_16px_0px]">
            <div className="grid grid-cols-[1.2fr_1.6fr_1.4fr] bg-[#f6f8fa] border-b border-[#e4e7ec] px-5 py-3">
              <div className="text-[11px] font-mono font-medium text-[#8f99a8] uppercase tracking-wider">Feature</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#266df0]" />
                <span className="text-[13px] font-semibold text-[#1c1d1f]">Cadence</span>
              </div>
              <div className="text-[13px] font-medium text-[#8f99a8]">Legacy Cloud APIs</div>
            </div>

            {rows.map(({ feature, cadence, others }, i) => (
              <div 
                key={feature} 
                className={`grid grid-cols-[1.2fr_1.6fr_1.4fr] px-5 py-3.5 items-center border-b border-[#eeeff1] last:border-b-0 ${
                  i % 2 === 0 ? "bg-white" : "bg-[#fcfdfd]"
                }`}
              >
                <div className="text-[13px] font-medium text-[#232529]">{feature}</div>
                <div className="flex items-start gap-2">
                  <span className="size-4 rounded-full bg-[#f4f5f6] border border-[#e4e7ec] flex items-center justify-center shrink-0 mt-0.5 text-[#266df0]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-[13px] text-[#1c1d1f] font-normal leading-relaxed">{cadence}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="size-4 rounded-full bg-[#f4f5f6] border border-[#e4e7ec] flex items-center justify-center shrink-0 mt-0.5 text-[#8f99a8]">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </span>
                  <span className="text-[13px] text-[#6f7988] leading-relaxed">{others}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label:"Free credits on signup", value:"10,000", sub:"No credit card required", color:"#1c1d1f" },
            { label:"Shared credit pool",     value:"Pay-as-you-go", sub:"Voice, music, stems & media", color:"#266df0" },
            { label:"Idle compute cost",      value:"$0.00",  sub:"Scale-to-zero serverless GPU", color:"#1c1d1f" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="text-center p-5 bg-[#ffffff] border border-[#e4e7ec] rounded-[12px] shadow-[0_1px_2px_rgba(28,40,64,0.04)]">
              <div className="text-[26px] font-semibold tracking-tight" style={{ color }}>{value}</div>
              <div className="text-[13px] font-medium text-[#1c1d1f] mt-1">{label}</div>
              <div className="text-[11px] text-[#8f99a8] font-mono mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
