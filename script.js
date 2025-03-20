const itemForm = document.getElementById('item-form');
const itemNameInput = document.getElementById('item-name');
const descriptionInput = document.getElementById('description');
const quantityInput = document.getElementById('quantity');
const unitPriceInput = document.getElementById('unit-price');
const inventoryBody = document.getElementById('inventory-body');
const modal = document.getElementById('editModal');
const modalForm = document.getElementById('edit-form');
const modalItemName = document.getElementById('modal-item-name');
const modalDescription = document.getElementById('modal-description');
const modalQuantity = document.getElementById('modal-quantity');
const modalUnitPrice = document.getElementById('modal-unit-price');
const closeBtn = document.querySelector('.close');
const toastContainer = document.getElementById('toast-container');

let inventory = [];  // This holds all items in memory
let editIndex = null; 

// a local storages the inventory
window.onload = () => {
  const storedInventory = localStorage.getItem('inventory');
  if (storedInventory) {
    inventory = JSON.parse(storedInventory);
    renderInventory();
  }
};

function saveToLocalStorage() {
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

// this is the notification when you add items successfully
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon;
    switch(type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'exclamation-circle';
            break;
        case 'warning':
            icon = 'trash-alt';
            break;
        default:
            icon = 'check-circle';
    }
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span class="toast-message">${message}</span>
        <span class="toast-close">
            <i class="fas fa-times"></i>
        </span>
    `;

    toastContainer.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    });

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Handle form submit 
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const itemName = itemNameInput.value.trim();
  const description = descriptionInput.value.trim();
  const quantity = parseInt(quantityInput.value);
  const unitPrice = parseFloat(unitPriceInput.value);

  if (!itemName || !description || isNaN(quantity) || isNaN(unitPrice)) {
    showToast('Please fill in all fields correctly!', 'error');
    return;
  }

  const item = {
    itemName,
    description,
    quantity,
    unitPrice
  };

  if (editIndex !== null) {
    // Update mode
    inventory[editIndex] = item;
    editIndex = null;
    itemForm.querySelector('button').textContent = 'Add Item';
  } else {
    // Add new item
    inventory.push(item);
  }

  itemForm.reset();
  saveToLocalStorage();
  renderInventory();
  showToast('Item added successfully!');
});



// this is table added to the inventory

function renderInventory() {
  inventoryBody.innerHTML = '';

  inventory.forEach((item, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${item.itemName}</td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td><i class="fa-solid fa-peso-sign"></i> ${item.unitPrice.toFixed(2)}</td>
      <td class="actions">
        <button class="edit-btn" onclick="editItem(${index})">
          <i class="fas fa-edit"></i>
          Edit
        </button>
        <button class="delete-btn" onclick="deleteItem(${index})">
          <i class="fas fa-trash"></i>
          Delete
        </button>
      </td>
    `;

    inventoryBody.appendChild(row);
  });
}

// Edit item button that displays the modal
function editItem(index) {
  const item = inventory[index];
  modalItemName.value = item.itemName;
  modalDescription.value = item.description;
  modalQuantity.value = item.quantity;
  modalUnitPrice.value = item.unitPrice;
  editIndex = index;
  modal.style.display = "block";
}

// Delete item
function deleteItem(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index, 1);
    saveToLocalStorage();
    renderInventory();
    showToast('Item deleted successfully!', 'warning');
  }
}

closeBtn.onclick = function() {
  modal.style.display = "none";
  editIndex = null;
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    editIndex = null;
  }
}


modalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const itemName = modalItemName.value.trim();
  const description = modalDescription.value.trim();
  const quantity = parseInt(modalQuantity.value);
  const unitPrice = parseFloat(modalUnitPrice.value);

  if (!itemName || !description || isNaN(quantity) || isNaN(unitPrice)) {
    showToast('Please fill in all fields correctly!', 'error');
    return;
  }

  const item = {
    itemName,
    description,
    quantity,
    unitPrice
  };

  inventory[editIndex] = item;
  modal.style.display = "none";
  editIndex = null;
  modalForm.reset();
  saveToLocalStorage();
  renderInventory();
  showToast('Item updated successfully!');
});
