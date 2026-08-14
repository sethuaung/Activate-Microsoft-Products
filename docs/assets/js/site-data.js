window.siteConfig = {
    siteName: 'Grimoire',
    siteUrl: 'https://tristaninsec.github.io/Grimoire'
};
window.pageData = {
    '01-getting-started-configuration': {
        page: 'Configuration',
        category: 'Getting Started',
        url: '01-getting-started/configuration.html',
        levels: ['Getting Started'],
        reading_time: 3
    },
    '01-getting-started-installation': {
        page: 'Installation Guide',
        category: 'Getting Started',
        url: '01-getting-started/installation.html',
        levels: ['Getting Started'],
        reading_time: 1
    },
    '01-getting-started-quick-start': {
        page: 'Quick Start',
        category: 'Getting Started',
        url: '01-getting-started/quick-start.html',
        levels: ['Getting Started'],
        reading_time: 1
    },
    '02-guides-advanced-customization': {
        page: 'Customization',
        category: 'Guides > Advanced',
        url: '02-guides/advanced/customization.html',
        levels: ['Guides', 'Advanced'],
        reading_time: 4
    },
    '02-guides-advanced-deployment': {
        page: 'Deployment',
        category: 'Guides > Advanced',
        url: '02-guides/advanced/deployment.html',
        levels: ['Guides', 'Advanced'],
        reading_time: 1
    },
    '02-guides-basics-frontmatter': {
        page: 'Frontmatter',
        category: 'Guides > Basics',
        url: '02-guides/basics/frontmatter.html',
        levels: ['Guides', 'Basics'],
        reading_time: 1
    },
    '02-guides-basics-markdown-basics': {
        page: 'Markdown Basics',
        category: 'Guides > Basics',
        url: '02-guides/basics/markdown-basics.html',
        levels: ['Guides', 'Basics'],
        reading_time: 1
    },
    '03-reference-cli': {
        page: 'CLI Reference',
        category: 'Reference',
        url: '03-reference/cli.html',
        levels: ['Reference'],
        reading_time: 1
    },
    '03-reference-config': {
        page: 'Config Reference',
        category: 'Reference',
        url: '03-reference/config.html',
        levels: ['Reference'],
        reading_time: 4
    },
    '04-tutorials-first-project': {
        page: 'Your First Project',
        category: 'Tutorials',
        url: '04-tutorials/first-project.html',
        levels: ['Tutorials'],
        reading_time: 1
    },
};
window.navData = {
    0: `
                <div class="nav-category">
                    <button class="category-header" data-category="01-getting-started">
                        <span>
                            <i class="fas fa-rocket category-icon"></i>
                            Getting Started
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="01-getting-started">
                                <a href="01-getting-started/configuration.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-configuration">
                                    <span class="nav-item-text">Configuration</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-configuration"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="01-getting-started/installation.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-installation">
                                    <span class="nav-item-text">Installation Guide</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-installation"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="01-getting-started/quick-start.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-quick-start">
                                    <span class="nav-item-text">Quick Start</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-quick-start"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="02-guides">
                        <span>
                            <i class="fas fa-book category-icon"></i>
                            Guides
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="02-guides">
                        <div class="nav-subcategory">
                            <button class="subcategory-header" data-category="02-guides-advanced">
                                <span><i class="fas fa-folder-open"></i> Advanced</span>
                                <i class="fas fa-chevron-right subcategory-chevron"></i>
                            </button>
                            <div class="subcategory-items" id="02-guides-advanced">
                                <a href="02-guides/advanced/customization.html" class="nav-item nav-item-depth-2" data-page="02-guides-advanced-customization">
                                    <span class="nav-item-text">Customization</span>
                                    <button class="bookmark-btn" data-page="02-guides-advanced-customization"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="02-guides/advanced/deployment.html" class="nav-item nav-item-depth-2" data-page="02-guides-advanced-deployment">
                                    <span class="nav-item-text">Deployment</span>
                                    <button class="bookmark-btn" data-page="02-guides-advanced-deployment"><i class="far fa-bookmark"></i></button>
                                </a>
                            </div>
                        </div>
                        <div class="nav-subcategory">
                            <button class="subcategory-header" data-category="02-guides-basics">
                                <span><i class="fas fa-folder-open"></i> Basics</span>
                                <i class="fas fa-chevron-right subcategory-chevron"></i>
                            </button>
                            <div class="subcategory-items" id="02-guides-basics">
                                <a href="02-guides/basics/frontmatter.html" class="nav-item nav-item-depth-2" data-page="02-guides-basics-frontmatter">
                                    <span class="nav-item-text">Frontmatter</span>
                                    <button class="bookmark-btn" data-page="02-guides-basics-frontmatter"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="02-guides/basics/markdown-basics.html" class="nav-item nav-item-depth-2" data-page="02-guides-basics-markdown-basics">
                                    <span class="nav-item-text">Markdown Basics</span>
                                    <button class="bookmark-btn" data-page="02-guides-basics-markdown-basics"><i class="far fa-bookmark"></i></button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="03-reference">
                        <span>
                            <i class="fas fa-cog category-icon"></i>
                            Reference
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="03-reference">
                                <a href="03-reference/cli.html" class="nav-item nav-item-depth-1" data-page="03-reference-cli">
                                    <span class="nav-item-text">CLI Reference</span>
                                    <button class="bookmark-btn" data-page="03-reference-cli"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="03-reference/config.html" class="nav-item nav-item-depth-1" data-page="03-reference-config">
                                    <span class="nav-item-text">Config Reference</span>
                                    <button class="bookmark-btn" data-page="03-reference-config"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="04-tutorials">
                        <span>
                            <i class="fas fa-graduation-cap category-icon"></i>
                            Tutorials
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="04-tutorials">
                                <a href="04-tutorials/first-project.html" class="nav-item nav-item-depth-1" data-page="04-tutorials-first-project">
                                    <span class="nav-item-text">Your First Project</span>
                                    <button class="bookmark-btn" data-page="04-tutorials-first-project"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>`,
    1: `
                <div class="nav-category">
                    <button class="category-header" data-category="01-getting-started">
                        <span>
                            <i class="fas fa-rocket category-icon"></i>
                            Getting Started
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="01-getting-started">
                                <a href="../01-getting-started/configuration.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-configuration">
                                    <span class="nav-item-text">Configuration</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-configuration"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../01-getting-started/installation.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-installation">
                                    <span class="nav-item-text">Installation Guide</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-installation"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../01-getting-started/quick-start.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-quick-start">
                                    <span class="nav-item-text">Quick Start</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-quick-start"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="02-guides">
                        <span>
                            <i class="fas fa-book category-icon"></i>
                            Guides
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="02-guides">
                        <div class="nav-subcategory">
                            <button class="subcategory-header" data-category="02-guides-advanced">
                                <span><i class="fas fa-folder-open"></i> Advanced</span>
                                <i class="fas fa-chevron-right subcategory-chevron"></i>
                            </button>
                            <div class="subcategory-items" id="02-guides-advanced">
                                <a href="../02-guides/advanced/customization.html" class="nav-item nav-item-depth-2" data-page="02-guides-advanced-customization">
                                    <span class="nav-item-text">Customization</span>
                                    <button class="bookmark-btn" data-page="02-guides-advanced-customization"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../02-guides/advanced/deployment.html" class="nav-item nav-item-depth-2" data-page="02-guides-advanced-deployment">
                                    <span class="nav-item-text">Deployment</span>
                                    <button class="bookmark-btn" data-page="02-guides-advanced-deployment"><i class="far fa-bookmark"></i></button>
                                </a>
                            </div>
                        </div>
                        <div class="nav-subcategory">
                            <button class="subcategory-header" data-category="02-guides-basics">
                                <span><i class="fas fa-folder-open"></i> Basics</span>
                                <i class="fas fa-chevron-right subcategory-chevron"></i>
                            </button>
                            <div class="subcategory-items" id="02-guides-basics">
                                <a href="../02-guides/basics/frontmatter.html" class="nav-item nav-item-depth-2" data-page="02-guides-basics-frontmatter">
                                    <span class="nav-item-text">Frontmatter</span>
                                    <button class="bookmark-btn" data-page="02-guides-basics-frontmatter"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../02-guides/basics/markdown-basics.html" class="nav-item nav-item-depth-2" data-page="02-guides-basics-markdown-basics">
                                    <span class="nav-item-text">Markdown Basics</span>
                                    <button class="bookmark-btn" data-page="02-guides-basics-markdown-basics"><i class="far fa-bookmark"></i></button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="03-reference">
                        <span>
                            <i class="fas fa-cog category-icon"></i>
                            Reference
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="03-reference">
                                <a href="../03-reference/cli.html" class="nav-item nav-item-depth-1" data-page="03-reference-cli">
                                    <span class="nav-item-text">CLI Reference</span>
                                    <button class="bookmark-btn" data-page="03-reference-cli"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../03-reference/config.html" class="nav-item nav-item-depth-1" data-page="03-reference-config">
                                    <span class="nav-item-text">Config Reference</span>
                                    <button class="bookmark-btn" data-page="03-reference-config"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="04-tutorials">
                        <span>
                            <i class="fas fa-graduation-cap category-icon"></i>
                            Tutorials
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="04-tutorials">
                                <a href="../04-tutorials/first-project.html" class="nav-item nav-item-depth-1" data-page="04-tutorials-first-project">
                                    <span class="nav-item-text">Your First Project</span>
                                    <button class="bookmark-btn" data-page="04-tutorials-first-project"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>`,
    2: `
                <div class="nav-category">
                    <button class="category-header" data-category="01-getting-started">
                        <span>
                            <i class="fas fa-rocket category-icon"></i>
                            Getting Started
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="01-getting-started">
                                <a href="../../01-getting-started/configuration.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-configuration">
                                    <span class="nav-item-text">Configuration</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-configuration"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../../01-getting-started/installation.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-installation">
                                    <span class="nav-item-text">Installation Guide</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-installation"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../../01-getting-started/quick-start.html" class="nav-item nav-item-depth-1" data-page="01-getting-started-quick-start">
                                    <span class="nav-item-text">Quick Start</span>
                                    <button class="bookmark-btn" data-page="01-getting-started-quick-start"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="02-guides">
                        <span>
                            <i class="fas fa-book category-icon"></i>
                            Guides
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="02-guides">
                        <div class="nav-subcategory">
                            <button class="subcategory-header" data-category="02-guides-advanced">
                                <span><i class="fas fa-folder-open"></i> Advanced</span>
                                <i class="fas fa-chevron-right subcategory-chevron"></i>
                            </button>
                            <div class="subcategory-items" id="02-guides-advanced">
                                <a href="../../02-guides/advanced/customization.html" class="nav-item nav-item-depth-2" data-page="02-guides-advanced-customization">
                                    <span class="nav-item-text">Customization</span>
                                    <button class="bookmark-btn" data-page="02-guides-advanced-customization"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../../02-guides/advanced/deployment.html" class="nav-item nav-item-depth-2" data-page="02-guides-advanced-deployment">
                                    <span class="nav-item-text">Deployment</span>
                                    <button class="bookmark-btn" data-page="02-guides-advanced-deployment"><i class="far fa-bookmark"></i></button>
                                </a>
                            </div>
                        </div>
                        <div class="nav-subcategory">
                            <button class="subcategory-header" data-category="02-guides-basics">
                                <span><i class="fas fa-folder-open"></i> Basics</span>
                                <i class="fas fa-chevron-right subcategory-chevron"></i>
                            </button>
                            <div class="subcategory-items" id="02-guides-basics">
                                <a href="../../02-guides/basics/frontmatter.html" class="nav-item nav-item-depth-2" data-page="02-guides-basics-frontmatter">
                                    <span class="nav-item-text">Frontmatter</span>
                                    <button class="bookmark-btn" data-page="02-guides-basics-frontmatter"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../../02-guides/basics/markdown-basics.html" class="nav-item nav-item-depth-2" data-page="02-guides-basics-markdown-basics">
                                    <span class="nav-item-text">Markdown Basics</span>
                                    <button class="bookmark-btn" data-page="02-guides-basics-markdown-basics"><i class="far fa-bookmark"></i></button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="03-reference">
                        <span>
                            <i class="fas fa-cog category-icon"></i>
                            Reference
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="03-reference">
                                <a href="../../03-reference/cli.html" class="nav-item nav-item-depth-1" data-page="03-reference-cli">
                                    <span class="nav-item-text">CLI Reference</span>
                                    <button class="bookmark-btn" data-page="03-reference-cli"><i class="far fa-bookmark"></i></button>
                                </a>
                                <a href="../../03-reference/config.html" class="nav-item nav-item-depth-1" data-page="03-reference-config">
                                    <span class="nav-item-text">Config Reference</span>
                                    <button class="bookmark-btn" data-page="03-reference-config"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>
                <div class="nav-category">
                    <button class="category-header" data-category="04-tutorials">
                        <span>
                            <i class="fas fa-graduation-cap category-icon"></i>
                            Tutorials
                        </span>
                        <i class="fas fa-chevron-right category-chevron"></i>
                    </button>
                    <div class="category-items" id="04-tutorials">
                                <a href="../../04-tutorials/first-project.html" class="nav-item nav-item-depth-1" data-page="04-tutorials-first-project">
                                    <span class="nav-item-text">Your First Project</span>
                                    <button class="bookmark-btn" data-page="04-tutorials-first-project"><i class="far fa-bookmark"></i></button>
                                </a>
                    </div>
                </div>`,
};
