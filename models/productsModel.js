const db = require('../config/db')

exports.fetchProductByProductId = async (id) => {
    const result = await db.query(
        `SELECT tbl_products.*,tbl_category.categoryName,tbl_subcategory.subcategoryName FROM tbl_products 
        LEFT JOIN tbl_category ON tbl_products.category = tbl_category.id 
        LEFT JOIN tbl_subcategory ON tbl_products.subCategory = tbl_subcategory.id 
        WHERE tbl_products.id = ?`,
        [id]
    );
    return result;
};


exports.fetchAllProducts = async (id) => {
    const result = await db.query(`SELECT tbl_products.*,tbl_category.categoryName,tbl_subcategory.subcategoryName FROM tbl_products
         LEFT JOIN tbl_category ON tbl_products.category = tbl_category.id 
         LEFT JOIN tbl_subcategory ON tbl_products.subCategory = tbl_subcategory.id 
         WHERE userId  = ? ORDER BY tbl_products.id DESC `, [id]);
    return result;
};

exports.fetchAllNotDeletedProductsProducts = async (id) => {
    const result = await db.query(`SELECT tbl_products.*,tbl_category.categoryName,tbl_subcategory.subcategoryName FROM tbl_products
         LEFT JOIN tbl_category ON tbl_products.category = tbl_category.id 
         LEFT JOIN tbl_subcategory ON tbl_products.subCategory = tbl_subcategory.id 
         WHERE tbl_products.isDeleted=0 AND userId  = ? ORDER BY tbl_products.id DESC `, [id]);
    return result;
};


exports.addProduct = async (data) => {
    const result = await db.query(
        `INSERT INTO tbl_products (
            userId, 
            title, 
            descriptions, 
            keyNote, 
            location, 
            category, 
            subCategory,
            size,
            depositeAmount, 
            rentDayPrice, 
            isDepositeNegotiable, 
            isRentNegotiable,
            tags, 
            productsImages, 
            productStatus,
            address,
            city,
            state,
            pincode,
            locality,
            isWeekly,
            isMonthly,
            isRent,
            isSell,
            postDescriptions,
            sellingPrice

        ) VALUES (?, ?,?,? ,?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            data.userId,
            data.title,
            data.descriptions,
            data.keyNote,
            data.location,
            data.category,
            data.subCategory,
            data.size,
            data.depositeAmount,
            data.rentDayPrice,
            data.isDepositeNegoitable,
            data.isRentNegoitable,
            data.tags,
            data.productsImages,
            data.productStatus,
            data.address,
            data.city,
            data.state,
            data.pincode,
            data.locality,
            data.isWeekly,
            data.isMonthly,
            data.isRent,
            data.isSell,
            data.postDescriptions,
            data.sellingPrice
        ]
    );
    return result;
};

exports.editProducts = async (obj, productId) => {
    let query = 'UPDATE tbl_products SET ';
    const fields = [];
    const values = [];
    Object.keys(obj).forEach((key) => {
        fields.push(`${key} = ?`);
        values.push(obj[key]);
    });
    query += fields.join(', ');
    query += ' WHERE id = ?';
    values.push(productId);
    const result = await db.query(query, values);
    return result;
};

exports.deleteProductById = async (id) => {
    return await db.query(`
        UPDATE tbl_products 
        SET isDeleted = 1
        WHERE id = ${id}
    `);
};


exports.addUsersGigs = async (data) => {
    return db.query("INSERT INTO tbl_gigs SET ?", [data]);
};

exports.fetchGigsByGigsId = async (id) => {
    const result = await db.query(
        `SELECT * FROM tbl_gigs WHERE id = ?`, [id]
    );
    return result;
};

exports.deleteGigsyId = async (id) => {
    return await db.query(`UPDATE tbl_gigs SET isDeleted = 1 WHERE id = ?`, [id]);
};



exports.fetchGigsByUserId = async (id) => {
    const result = await db.query(
        `SELECT * FROM tbl_gigs WHERE userId = ? And isDeleted = 0`, [id]
    );
    return result;
};

exports.editGigsByGigsId = async (obj, productId) => {
    console.log('obj',obj);
    
    let query = 'UPDATE tbl_gigs SET ';
    const fields = [];
    const values = [];
    Object.keys(obj).forEach((key) => {
        fields.push(`${key} = ?`);
        values.push(obj[key]);
    });
    query += fields.join(', ');
    query += ' WHERE id = ?';
    values.push(productId);
    const result = await db.query(query, values);
    return result;
};

exports.fetchProductById = async (id) => {
    const result = await db.query(
        `SELECT * FROM tbl_products WHERE id = ?`, [id]
    );
    return result;
};

