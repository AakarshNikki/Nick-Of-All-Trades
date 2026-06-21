class Details {
    constructor() {
        this.DOM = {};

        const detailsTmpl = `
        <div class="details__bg details__bg--down">
            <div class="details__description"></div>
        </div>						
        <button class="details__close"><i class="fas fa-2x fa-times icon--cross tm-fa-close"></i></button>
        `;

        this.DOM.details = document.createElement('div');
        this.DOM.details.className = 'details';
        this.DOM.details.innerHTML = detailsTmpl;
        document.getElementById('tm-wrap').appendChild(this.DOM.details);
        this.init();
    }

    init() {
        this.DOM.bgDown = this.DOM.details.querySelector('.details__bg--down');
        this.DOM.description = this.DOM.details.querySelector('.details__description');
        this.DOM.close = this.DOM.details.querySelector('.details__close');
        this.initEvents();
    }

    initEvents() {
        this.DOM.details.addEventListener('click', (event) => {
            if (event.target === this.DOM.details) this.close();
        });
        
        this.DOM.bgDown.addEventListener('click', (event) => event.stopPropagation());
        
        this.DOM.close.addEventListener('click', (event) => {
            event.stopPropagation();
            this.close();
        });
    }

    fill(info) {
        this.DOM.description.innerHTML = info.description;
    }

    getProductDetailsRect() {
        try {
            return {
                productBgRect: this.DOM.productBg.getBoundingClientRect(),
                detailsBgRect: this.DOM.bgDown.getBoundingClientRect()
            };
        } catch(e) {
            return { productBgRect: {left:0,top:0,width:0,height:0}, detailsBgRect: {left:0,top:0,width:0,height:0} };
        }
    }

    open(data) {
        if(this.isAnimating) return false;
        this.isAnimating = true;

        this.DOM.details.style.display = 'block'; 
        this.DOM.details.classList.add('details--open');
        this.DOM.details.scrollTop = 0; 

        this.DOM.productBg = data.productBg;
        this.DOM.productBg.style.opacity = 0;

        gsap.set(this.DOM.bgDown, { clearProps: "all" });

        const rect = this.getProductDetailsRect();

        gsap.set(this.DOM.bgDown, {
            transformOrigin: "0px 0px",
            x: rect.productBgRect.left - rect.detailsBgRect.left,
            y: rect.productBgRect.top - rect.detailsBgRect.top,
            scaleX: rect.productBgRect.width / rect.detailsBgRect.width,
            scaleY: rect.productBgRect.height / rect.detailsBgRect.height,
            opacity: 1,
            borderRadius: "50%"
        });

        gsap.to(this.DOM.bgDown, {
            duration: 0.8,
            ease: "power3.inOut",
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            borderRadius: "0px",
            onComplete: () => this.isAnimating = false
        });

        gsap.fromTo(this.DOM.description,
            { y: 50, opacity: 0 },
            { duration: 0.6, y: 0, opacity: 1, ease: "power2.out", delay: 0.2 }
        );

        gsap.fromTo(this.DOM.close,
            { y: -100, opacity: 0 },
            { duration: 0.5, y: 0, opacity: 1, ease: "back.out(1.2)", delay: 0.4 }
        );
    }

    close() {
        if(this.isAnimating || !this.DOM.details.classList.contains('details--open')) return false;
        this.isAnimating = true;

        this.DOM.details.classList.remove('details--open');

        gsap.to(this.DOM.close, { duration: 0.2, y: -100, opacity: 0, ease: "power2.in" });
        gsap.to(this.DOM.description, { duration: 0.15, opacity: 0, ease: "none" });

        const rect = this.getProductDetailsRect();

        gsap.to(this.DOM.bgDown, {
            duration: 0.5,
            ease: "power3.inOut",
            transformOrigin: "0px 0px",
            x: rect.productBgRect.left - rect.detailsBgRect.left,
            y: rect.productBgRect.top - rect.detailsBgRect.top,
            scaleX: rect.productBgRect.width / rect.detailsBgRect.width,
            scaleY: rect.productBgRect.height / rect.detailsBgRect.height,
            borderRadius: "50%",
            delay: 0.1,
            onComplete: () => {
                this.DOM.bgDown.style.opacity = 0;
                gsap.set(this.DOM.bgDown, { clearProps: "transform" });
                this.DOM.productBg.style.opacity = 1;
                this.DOM.details.style.display = 'none';
                this.isAnimating = false;
            }
        });
    }
}

class Item {
    constructor(el) {
        this.DOM = {};
        this.DOM.el = el;
        this.DOM.product = this.DOM.el.querySelector('.product');
        this.DOM.productBg = this.DOM.product.querySelector('.product__bg');
        this.info = { description: this.DOM.product.querySelector('.product__description').innerHTML };
        this.initEvents();
    }

    initEvents() {
        this.DOM.product.addEventListener('click', (e) => {
            e.stopPropagation();
            this.open();
        });
    }

    open() {
        // Prevent double clicking while it spins or modal is open
        if (this.isSpinning || DOM.details.isAnimating) return;
        this.isSpinning = true;

        const link = this.DOM.product.querySelector('.tm-nav-link');
        
        // Add a specific class to stop the mouse Gyro tracking temporarily
        this.DOM.product.classList.add("is-spinning");

        // Use a relative "+=360" so it seamlessly spins from wherever the gyro left it!
        gsap.to(link, {
            rotationY: "+=360", 
            rotationX: 0, 
            scale: 1.15, 
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(link, { scale: 1, duration: 0.2 }); 
                
                DOM.details.fill(this.info);
                DOM.details.open({ productBg: this.DOM.productBg });
                
                this.DOM.product.classList.remove("is-spinning");
                this.isSpinning = false;
            }
        });
    }
}

const DOM = {};
document.addEventListener("DOMContentLoaded", () => {
    DOM.grid = document.querySelector('.grid');
    if(DOM.grid) {
        DOM.content = DOM.grid.parentNode;
        DOM.gridItems = Array.from(DOM.grid.querySelectorAll('.grid__item'));
        let items = [];
        DOM.gridItems.forEach(item => items.push(new Item(item)));
        DOM.details = new Details();
    }
});