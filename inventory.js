// Move inventory array outside the DOMContentLoaded event to make it globally accessible
let inventory = [];

document.addEventListener('DOMContentLoaded', () => {
    // Clear localStorage inventory data
    localStorage.removeItem('inventory');
    
    // Initialize empty inventory array
    let inventory = [];

    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'log-sign.html';
        return;
    }

    // Set user name
    document.getElementById('userName').textContent = currentUser.name;

    // Initialize variables
    let currentItemId = null;

    // Get DOM elements
    const itemForm = document.getElementById('itemForm');
    const inventoryBody = document.getElementById('inventoryBody');
    const itemModal = document.getElementById('itemModal');
    const addItemBtn = document.getElementById('addItemBtn');
    const deleteModal = document.getElementById('deleteModal');

    // Add search and sort functionality
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const itemCountSpan = document.getElementById('itemCount');

    // Initialize DOM elements
    const itemNameInput = document.getElementById('itemName');
    const itemDescriptionInput = document.getElementById('itemDescription');
    const itemQuantityInput = document.getElementById('itemQuantity');
    const itemPriceInput = document.getElementById('itemPrice');

    // Show empty state initially
    renderInventory();

    // Show Modal when Add Item button is clicked
    addItemBtn.addEventListener('click', () => {
        openModal('itemModal');
    });

    // Load inventory immediately when page loads (remove window.onload)
    loadInventory();

    // Add this function to load inventory
    function loadInventory() {
        const storedInventory = localStorage.getItem('inventory');
        if (storedInventory) {
            inventory = JSON.parse(storedInventory);
            renderInventory();
            updateItemCount(inventory.length);
        }
    }

    // Save to localStorage
    function saveToLocalStorage() {
        try {
            localStorage.setItem('inventory', JSON.stringify(inventory));
            console.log('Saved to localStorage:', inventory); // Debug log
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            showNotification('Error saving data', 'error');
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        // Remove any existing notifications first
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                             type === 'error' ? 'exclamation-circle' : 
                             'trash-alt'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });

        // Auto dismiss after 2.5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }

    // Handle form submission for new items
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted');

        const name = itemNameInput.value.trim();
        const description = itemDescriptionInput.value.trim();
        const quantity = parseInt(itemQuantityInput.value);
        const price = parseFloat(itemPriceInput.value);

        if (!name || !description || isNaN(quantity) || isNaN(price)) {
            showNotification('Please fill in all fields correctly!', 'error');
            return;
        }

        // Check if we're editing or adding
        if (currentItemId) {
            // Update existing item
            const index = inventory.findIndex(item => item.id === currentItemId);
            if (index !== -1) {
                inventory[index] = {
                    ...inventory[index],
                    name,
                    description,
                    quantity,
                    price
                };
                showNotification('Item updated successfully!');
            }
            currentItemId = null; // Reset the editing state
        } else {
            // Add new item
            const newItem = {
                id: Date.now(),
                name,
                description,
                quantity,
                price
            };
            inventory.push(newItem);
            showNotification('Item added successfully!');
        }

        // Save and update display
        saveToLocalStorage();
        renderInventory();
        itemForm.reset();
        closeModal('itemModal');
    });

    // Render inventory table
    function renderInventory() {
        console.log('Rendering inventory:', inventory);
        inventoryBody.innerHTML = '';

        // Update item count first
        updateItemCount(inventory.length);

        if (inventory.length === 0) {
            inventoryBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            <p>No items in inventory</p>
                            <span>Click "Add Product" to get started</span>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        inventory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>₱${parseFloat(item.price).toFixed(2)}</td>
                <td>₱${(item.quantity * item.price).toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editItem(${item.id})" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteItem(${item.id})" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            inventoryBody.appendChild(row);
        });
    }

    // Make functions globally available
    window.editItem = function(id) {
        const item = inventory.find(i => i.id === id);
        if (item) {
            currentItemId = id; // Set the current item being edited
            itemNameInput.value = item.name;
            itemDescriptionInput.value = item.description;
            itemQuantityInput.value = item.quantity;
            itemPriceInput.value = item.price;
            
            document.getElementById('modalTitle').textContent = 'Edit Item';
            document.getElementById('saveBtn').textContent = 'Update Item';
            openModal('itemModal');
        }
    };

    window.deleteItem = function(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            inventory = inventory.filter(item => item.id !== id);
            saveToLocalStorage();
            renderInventory();
            showNotification('Item deleted successfully!', 'warning');
        }
    };

    // Search functionality
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredInventory = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
        
        renderInventory(filteredInventory);
    }

    // Helper functions
    function updateItemCount(count) {
        const itemCountSpan = document.getElementById('itemCount');
        if (itemCountSpan) {
            itemCountSpan.textContent = `${count} item${count !== 1 ? 's' : ''}`;
        }
    }

    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    // Modal functions
    window.openModal = function(modalId) {
        document.getElementById(modalId).style.display = 'block';
    };

    window.closeModal = function(modalId) {
        document.getElementById(modalId).style.display = 'none';
        if (modalId === 'itemModal') {
            itemForm.reset();
            currentItemId = null; // Reset the editing state
            document.getElementById('modalTitle').textContent = 'Add New Item';
            document.getElementById('saveBtn').textContent = 'Save Item';
        }
    };

    // Event listeners
    searchInput.addEventListener('input', handleSearch);

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    };

    // Close modal when clicking close button
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        };
    });

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'log-sign.html';
    });

    // Enhanced search and sort functionality
    function initializeSearchAndSort() {
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const inventoryBody = document.getElementById('inventoryBody');

        // Enhanced search function with multiple field search
        function searchItems(query) {
            const items = Array.from(inventoryBody.getElementsByTagName('tr'))
                .filter(row => !row.classList.contains('no-results-row'));
            
            query = query.toLowerCase().trim();
            let hasVisibleItems = false;

            // If search is empty, show all items
            if (!query) {
                items.forEach(item => item.style.display = '');
                removeNoResultsMessage();
                return;
            }

            items.forEach(item => {
                const name = item.cells[0].textContent.toLowerCase();
                const description = item.cells[1].textContent.toLowerCase();
                const price = item.cells[3].textContent.toLowerCase();
                
                // Search across multiple fields
                const isVisible = 
                    name.includes(query) || 
                    description.includes(query) || 
                    price.includes(query);

                item.style.display = isVisible ? '' : 'none';
                if (isVisible) hasVisibleItems = true;
            });

            // Show/hide no results message
            if (!hasVisibleItems) {
                showNoResultsMessage(query);
            } else {
                removeNoResultsMessage();
            }
        }

        // Enhanced sort function with numeric and string handling
        function sortItems(criteria) {
            const items = Array.from(inventoryBody.getElementsByTagName('tr'))
                .filter(row => !row.classList.contains('no-results-row'));
            
            if (!criteria) return;

            const [field, direction] = criteria.split('-');
            const multiplier = direction === 'asc' ? 1 : -1;

            items.sort((a, b) => {
                let aValue, bValue;

                switch(field) {
                    case 'name':
                        aValue = a.cells[0].textContent.toLowerCase();
                        bValue = b.cells[0].textContent.toLowerCase();
                        return multiplier * aValue.localeCompare(bValue);

                    case 'price':
                        aValue = parseFloat(a.cells[3].textContent.replace(/[^0-9.-]+/g, ''));
                        bValue = parseFloat(b.cells[3].textContent.replace(/[^0-9.-]+/g, ''));
                        return multiplier * (aValue - bValue);

                    case 'quantity':
                        aValue = parseInt(a.cells[2].textContent);
                        bValue = parseInt(b.cells[2].textContent);
                        return multiplier * (aValue - bValue);

                    default:
                        return 0;
                }
            });

            // Re-append sorted items
            items.forEach(item => {
                inventoryBody.appendChild(item);
                // Add subtle animation
                item.style.animation = 'sortFade 0.3s ease-out';
            });
        }

        // Helper function to show no results message
        function showNoResultsMessage(query) {
            removeNoResultsMessage();
            const message = document.createElement('tr');
            message.className = 'no-results-row';
            message.innerHTML = `
                <td colspan="6">
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>No items found for "${query}"</p>
                        <span>Try adjusting your search term or clear the search</span>
                        <button class="clear-search-btn">Clear Search</button>
                    </div>
                </td>
            `;

            // Add clear search button functionality
            message.querySelector('.clear-search-btn').addEventListener('click', () => {
                searchInput.value = '';
                searchItems('');
            });

            inventoryBody.appendChild(message);
        }

        // Helper function to remove no results message
        function removeNoResultsMessage() {
            const existingMessage = document.querySelector('.no-results-row');
            if (existingMessage) {
                existingMessage.remove();
            }
        }

        // Debounce function for search
        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        // Event listeners
        searchInput.addEventListener('input', debounce((e) => {
            searchItems(e.target.value);
            // Maintain current sort if exists
            if (sortSelect.value) {
                sortItems(sortSelect.value);
            }
        }, 300));

        sortSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                sortItems(e.target.value);
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Focus search box with Ctrl + F or Command + F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInput.focus();
            }
            // Clear search with Escape
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                searchItems('');
            }
        });
    }

    // Add this CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sortFade {
            from {
                opacity: 0.5;
                transform: translateY(-5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .clear-search-btn {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #e2e8f0;
            border: none;
            border-radius: 6px;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .clear-search-btn:hover {
            background: #cbd5e1;
            color: #1e293b;
        }
    `;
    document.head.appendChild(style);

    // Initialize search and sort functionality when DOM is loaded
    initializeSearchAndSort();
});
