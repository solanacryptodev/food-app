import uniqid from 'uniqid';

export default class List 
{
    constructor()
    {
        this.items = [];
    }
    /**
     * The purpose of this method is to add items to the empty array in the Constructor.
     */
    addItem (count, unit, ingredient)
    {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id)
    {
        const index = this.items.findIndex(el => el.id === id);
        this.items.splice(index, 1);
    }

    updateCount(id, newCount)
    {
        this.items.find(el => el.id === id).count = newCount;
    }
}