import 'flowbite';
import { contactForm } from './contact-form.js';

contactForm();

// Mobile menu toggle
const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');

if (btn && menu) {
    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });
}
// Close mobile menu when a nav link is clicked
const navLinks = document.querySelectorAll('#mobile-menu a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
    });
});

// ===== Dog breeds data =====
const breeds = [
    // SMALL
    { name: "Chihuahua Mix", size: "Small", energy: "Low energy", cost: 45, color: "teal",img:"/chihuahua.jpg" },
    { name: "Chihuahua long haired Mix", size: "Small", energy: "Low energy", cost: 50, color: "orange",img:"/chihuahua long hair.jpg" },
    { name: "Border Terrier Mix", size: "Small", energy: "Medium energy", cost: 55, color: "teal" ,img:"/borderterrier.jpg"},
    { name: "Shihtzu Mix", size: "Small", energy: "Low energy", cost: 50, color: "orange" ,img:"/shihtzu.jpg"},

    // MEDIUM
    { name: "Cattle Mix", size: "Medium", energy: "High energy", cost: 70, color: "teal", img:"/cattle dog mix.jpg"},
    { name: "Australian Cattle Mix", size: "Medium", energy: "High energy", cost: 75, color: "orange", img:"/Australian cattle mix.jpg"},
    { name: "Spaniel Mix", size: "Medium", energy: "Medium energy", cost: 65, color: "teal" ,img:"/spaniel mix.jpg"},
    { name: "Border Collie Mix", size: "Medium", energy: "High energy", cost: 70, color: "orange" ,img:"/border collie mix.jpg"}
]

// ===== Render the breed cards =====
function renderBreeds(filter = "Small") {
    const container = document.getElementById("breeds-container");
    if (!container) return;

    container.innerHTML = "";

    const filtered = breeds.filter(breed => breed.size === filter);

    filtered.forEach(breed => {
        const bgColor = breed.color === "teal" ? "bg-teal-200/80" : "bg-orange-200/80";
        const tagColor = breed.color === "teal"
            ? "bg-teal-100 text-teal-800"
            : "bg-orange-100 text-orange-800";

        const card =
            '<div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">' +
            '<div class="aspect-[3/4] overflow-hidden">' +
            '<img src="' + breed.img + '" alt="' + breed.name + '" class="w-full h-full object-cover">' +
            '</div>' +
            '<div class="p-5">' +
            '<h3 class="font-semibold text-lg mb-2">' + breed.name + '</h3>' +
            '<div class="flex gap-2 mb-3">' +
            '<span class="text-xs ' + tagColor + ' px-2.5 py-1 rounded-full">' + breed.size + '</span>' +
            '<span class="text-xs ' + tagColor + ' px-2.5 py-1 rounded-full">' + breed.energy + '</span>' +
            '</div>' +
            '<p class="text-stone-500 text-sm">\~$' + breed.cost + ' / month</p>' +
            '</div>' +
            '</div>'

        container.innerHTML += card;
    });
}

// ===== Filter buttons =====
const activeClasses = ["bg-orange-500", "text-white"];
const inactiveClasses = ["hover:bg-orange-100"];

function setActiveButton(activeBtn, buttons) {
    buttons.forEach(btn => {
        if (!btn) return;
        const isActive = btn === activeBtn;
        btn.classList.toggle(activeClasses[0], isActive);
        btn.classList.toggle(activeClasses[1], isActive);
        btn.classList.toggle(inactiveClasses[0], !isActive);
    });
}

function setupFilterButtons() {
    const btnSmall = document.getElementById("btn-small");
    const btnMedium = document.getElementById("btn-medium");
    const buttons = [btnSmall, btnMedium];

    if (btnSmall) {
        btnSmall.addEventListener("click", () => {
            renderBreeds("Small");
            setActiveButton(btnSmall, buttons);
        });
    }
    if (btnMedium) {
        btnMedium.addEventListener("click", () => {
            renderBreeds("Medium");
            setActiveButton(btnMedium, buttons);
        });
    }
}

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {
    renderBreeds("Small");
    setupFilterButtons();
});
