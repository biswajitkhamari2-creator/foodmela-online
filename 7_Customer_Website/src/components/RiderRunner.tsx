/**
 * RiderRunner — FoodMela delivery cyclist zooming across the bottom
 * of the screen with a branded delivery bag on the rear rack.
 * Pure CSS animation, no assets. pointer-events:none so it never blocks taps.
 */
export default function RiderRunner() {
  return (
    <div className="rider-lane" aria-hidden="true">
      <div className="rider-track">
        <div className="rider">
          <div className="r-bubble">⚡ On the way!</div>
          <div className="r-speed"><i /><i /><i /></div>

          {/* bike frame */}
          <div className="b-frame">
            <div className="b-toptube" />
            <div className="b-downtube" />
            <div className="b-seattube" />
            <div className="b-chainstay" />
            <div className="b-seatstay" />
            <div className="b-fork" />
            <div className="b-headtube" />
            <div className="b-stem" />
            <div className="b-handlebar" />

            {/* wheels */}
            <div className="b-wheel rear">
              <div className="b-spokes"><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="b-rim" />
              <div className="b-tire" />
              <div className="b-hub" />
            </div>
            <div className="b-wheel front">
              <div className="b-spokes"><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="b-rim" />
              <div className="b-tire" />
              <div className="b-hub" />
            </div>

            {/* drivetrain */}
            <div className="b-chainring" />
            <div className="b-crank rear" />
            <div className="b-crank front" />
            <div className="b-pedal rear" />
            <div className="b-pedal front" />
            <div className="b-chain top" />
            <div className="b-chain bottom" />

            {/* saddle + seatpost */}
            <div className="b-seatpost" />
            <div className="b-saddle" />

            {/* rear rack + FoodMela bag */}
            <div className="b-rack">
              <div className="b-bag">
                <span className="b-badge">F</span>
                <em>FOODMELA</em>
              </div>
            </div>

            {/* rider body */}
            <div className="r-body">
              <div className="r-legs">
                <div className="r-thigh rear" /><div className="r-shin rear" /><div className="r-foot rear" />
                <div className="r-thigh front" /><div className="r-shin front" /><div className="r-foot front" />
              </div>
              <div className="r-torso">
                <div className="r-jersey"><span className="r-logo">F</span></div>
                <div className="r-arms">
                  <div className="r-upper rear" /><div className="r-fore rear" /><div className="r-hand rear" />
                  <div className="r-upper front" /><div className="r-fore front" /><div className="r-hand front" />
                </div>
              </div>
              <div className="r-head">
                <div className="r-helmet"><span className="r-visor" /></div>
              </div>
            </div>
          </div>

          <div className="r-dust rear"><i /><i /><i /></div>
          <div className="r-dust front"><i /><i /><i /></div>
          <div className="r-shadow" />
        </div>
      </div>
    </div>
  );
}