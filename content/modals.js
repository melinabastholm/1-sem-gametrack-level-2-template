export const MODAL_CONTENT = {
    coin_sign: {
        title: "Coin Sign",
        maxWidth: "90vw",
        maxHeight: "90vh",
        html: `
            <article class="village-sign">
                <header class="village-sign__hero">
                    <p class="village-sign__kicker">Trigger Conditions</p>
                    <h3>How this sign checks for a coin</h3>
                    <p>
                        A trigger can look at the player's <code>items</code> and <code>stats</code>
                        before deciding what should happen.
                    </p>
                </header>

                <section class="village-sign__grid">
                    <div class="village-sign__card">
                        <h4>1. Add conditions</h4>
                        <p>
                            Put a <code>conditions</code> array on the trigger. Every condition in the
                            list must pass before the main <code>actions</code> run.
                        </p>
                        <p class="village-sign__tag">conditions</p>
                    </div>

                    <div class="village-sign__card">
                        <h4>2. Pick what to check</h4>
                        <p>
                            Use <code>scope</code> to choose <code>items</code> or <code>stats</code>,
                            then set the <code>key</code>, <code>op</code>, and <code>value</code>.
                        </p>
                        <p class="village-sign__tag">items / stats</p>
                    </div>

                    <div class="village-sign__card">
                        <h4>3. Add a fallback</h4>
                        <p>
                            If a condition fails, the trigger can run an <code>elseAction</code> instead.
                            That is useful for locked doors, shops, and warning messages.
                        </p>
                        <p class="village-sign__tag">elseAction</p>
                    </div>
                </section>

                <section class="village-sign__card">
                    <h4>Example</h4>
                    <pre><code>{
    id: "coin_sign",
    type: "onInteractCell",
    x: 10,
    y: 3,
    conditions: [
        { scope: "items", key: "coin", op: ">=", value: 1 }
    ],
    actions: [
        {
            kind: "openModalHtml",
            contentKey: "coin_sign"
        }
    ],
    elseAction: {
        kind: "openModalText",
        title: "Need a coin",
        text: "Bring 1 coin to read this sign."
    }
}</code></pre>
                </section>

                <aside class="village-sign__callout">
                    <strong>Simple rule:</strong>
                    If all conditions pass, run <code>actions</code>. If one fails, run
                    <code>elseAction</code> if it exists.
                </aside>
            </article>
        `,
    },
    village_sign: {
        title: "Village Sign",
        maxWidth: "90vw",
        maxHeight: "90vh",
        html: `
            <article class="village-sign">
                <header class="village-sign__hero">
                    <p class="village-sign__kicker">Map Notice Board</p>
                    <h3>Welcome to Starter Village</h3>
                    <p>Everything here is editable. Use this modal as a design playground for your own quests and lore.</p>
                </header>

                <section class="village-sign__grid">
                    <div class="village-sign__card">
                        <h4>Build Zone</h4>
                        <p>Solid tiles are blocked cells from <code>js/config.js</code>. Use <code>{ x, y }</code> for one tile, or <code>{ x1, y1, x2, y2 }</code> to fill a full line/rectangle between two points.</p>
                        <p class="village-sign__tag">Collision</p>
                    </div>

                    <div class="village-sign__card">
                        <h4>Portal Tip</h4>
                        <p>Step on glowing portal tiles to trigger a teleport action.</p>
                        <p class="village-sign__tag">Trigger + Action</p>
                    </div>

                    <div class="village-sign__card">
                        <h4>Interaction Tip</h4>
                        <p>Face a tile and press <strong>Space</strong> or <strong>Enter</strong> to interact.</p>
                        <p class="village-sign__tag">onInteractCell</p>
                    </div>
                </section>

                <aside class="village-sign__callout">
                    <strong>Try this next:</strong>
                    Copy this block, change text/colors/classes, and make your own styled location card.
                </aside>
            </article>
        `,
    },
    intro_clip: {
        title: "Intro Clip",
        videoSrc: "assets/video/intro.mp4",
        videoType: "video/mp4",
        description: "Sample local video file from assets/video/intro.mp4",
    },
};
