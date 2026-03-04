export const MODAL_CONTENT = {
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
        `
    },
    intro_clip: {
        title: "Intro Clip",
        videoSrc: "assets/video/intro.mp4",
        videoType: "video/mp4",
        description: "Sample local video file from assets/video/intro.mp4"
    }
};

