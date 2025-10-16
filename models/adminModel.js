const db = require('../config/db')

exports.fetchAllReportUsers = async () => {
    return await db.query(`SELECT * FROM tbl_reportedusers`);
};

exports.isAdminExistsOrNot = async (email) => {
    return db.query("SELECT * FROM tbl_superadmin WHERE email = ?", [email]);
};

exports.fetchAdminById = async (id) => {
    const result = await db.query(`SELECT * FROM tbl_superadmin WHERE id = ?`, [id]);
    return result;
};

exports.updateAdminProfile = async (updatedFields, id) => {
    const keys = Object.keys(updatedFields);
    const values = Object.values(updatedFields);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(id);
    const query = `UPDATE tbl_superadmin SET ${setClause} WHERE id = ?`;
    return db.query(query, values);
};

exports.fetchAllProductsOfUsers = async () => {
    const result = await db.query(`SELECT tbl_products.*,tbl_category.categoryName,tbl_subcategory.subcategoryName FROM tbl_products
         LEFT JOIN tbl_category ON tbl_products.category = tbl_category.id 
         LEFT JOIN tbl_subcategory ON tbl_products.subCategory = tbl_subcategory.id 
         WHERE tbl_products.isDeleted=0 ORDER BY tbl_products.id DESC `);
    return result;
};

exports.fetchUsersByProductsId = async (id) => {
    console.log('id', id);

    const result = await db.query(`SELECT tbl_users.* FROM tbl_products
         LEFT JOIN tbl_users ON tbl_products.userId = tbl_users.id 
         WHERE tbl_products.id = ?`, [id]);
    return result;
};

exports.approvedProductById = async (id) => {
    return await db.query(`
        UPDATE tbl_products 
        SET productStatus = 1
        WHERE id = ${id}
    `);
};

exports.rejectProductById = async (id) => {
    return await db.query(`
        UPDATE tbl_products 
        SET productStatus = 2
        WHERE id = ${id}
    `);
};

exports.fetchProductByProductIdOnAdminPanel = async (id) => {
    const result = await db.query(
        `SELECT tbl_products.*,tbl_category.categoryName,tbl_subcategory.subcategoryName FROM tbl_products 
        LEFT JOIN tbl_category ON tbl_products.category = tbl_category.id 
        LEFT JOIN tbl_subcategory ON tbl_products.subCategory = tbl_subcategory.id 
        WHERE tbl_products.id = ?`,
        [id]
    );
    return result;
};

exports.fetchAllCategoryList = async () => {
    const result = await db.query('SELECT * FROM tbl_category ORDER BY createdAt DESC');
    return result;
};

exports.listOfSubCategoryByCategoryId = async (id) => {
    const result = await db.query('SELECT * FROM tbl_subcategory WHERE categoryId = ?', [id]);
    return result;
};

exports.fetchAllSubCategoryList = async () => {
    const result = await db.query('SELECT * FROM tbl_subcategory');
    return result;
};

exports.isCategoryExistsByCategoryName = async (categoryName) => {
    const result = await db.query(
        'SELECT * FROM tbl_category WHERE categoryName LIKE ? ORDER BY createdAt DESC',
        [`%${categoryName}%`]
    );
    return result;
};

exports.createNewCategories = async (categoryName) => {
    const result = await db.query(
        'INSERT INTO tbl_category (categoryName) VALUES (?)',
        [categoryName]
    );
    return result;
};

exports.isSubCategoryExistsByName = async (subCategoryName, categoryId) => {
    return await db.query(
        'SELECT * FROM tbl_subcategory WHERE subcategoryName LIKE ? AND categoryId = ?',
        [`%${subCategoryName}%`, categoryId]
    );
};

exports.createNewSubCategory = async (subCategoryName, categoryId) => {
    return await db.query(
        'INSERT INTO tbl_subcategory (subcategoryName, categoryId) VALUES (?, ?)',
        [subCategoryName, categoryId]
    );
};

exports.fetchAllUsers = async () => {
    return await db.query(`SELECT * FROM tbl_users `);
};

exports.editCategoriesByIds = async (categoryName, id) => {
    return await db.query('UPDATE tbl_category SET categoryName = ? WHERE id = ?', [categoryName, id]);
}

exports.duplicateSubCategory = async (subCategoryName, subCategoryId) => {
    return await db.query(
        'SELECT * FROM tbl_subcategory WHERE subcategoryName = ? AND id != ?',
        [subCategoryName, subCategoryId]
    )
};

exports.editSubCategoriesByIds = async (subCategoryName, categoryId, subCategoryId) => {
    return await db.query('UPDATE tbl_subcategory SET subcategoryName = ?, categoryId = ? WHERE id = ?',
        [subCategoryName, categoryId, subCategoryId]);
}

exports.fetchChatByUsersIdAnotherUsersId = async (user1Id, user2Id) => {
    return await db.query(`SELECT * FROM tbl_chat WHERE ((user1_id = ${user1Id} AND user2_id = ${user2Id}) OR (user1_id = ${user2Id} AND user2_id = ${user1Id}))`)
};

exports.addFeaturesByAdmin = async (data) => {
    return db.query("INSERT INTO tbl_features SET ?", [data]);
};

exports.fetchAllFeaturesByAdmin = async () => {
    return await db.query(`SELECT * FROM tbl_features ORDER BY createdAt DESC`);
};

exports.editFeatureById = async (obj, id) => {
    let query = 'UPDATE tbl_features SET ';
    const fields = [];
    const values = [];
    Object.keys(obj).forEach((key) => {
        fields.push(`${key} = ?`);
        values.push(obj[key]);
    });
    query += fields.join(', ');
    query += ' WHERE id = ?';
    values.push(id);
    console.log('query',query);
    
    const result = await db.query(query, values);
    return result;
};

exports.deleteFeatureById = async (id) => {
    return await db.query(`DELETE FROM tbl_features where id=?`, [id]);
};

exports.addSearchSuggestionsByAdmin = async (data) => {
    return db.query("INSERT INTO tbl_searchsuggestions SET ?", [data]);
};

exports.fetchAllSearchSuggestionsByAdmin = async () => {
    return await db.query(`SELECT * FROM tbl_searchsuggestions ORDER BY createdAt DESC`);
};

exports.editSearchSuggestionsById = async (obj, id) => {
    let query = 'UPDATE tbl_searchsuggestions SET ';
    const fields = [];
    const values = [];
    Object.keys(obj).forEach((key) => {
        fields.push(`${key} = ?`);
        values.push(obj[key]);
    });
    query += fields.join(', ');
    query += ' WHERE id = ?';
    values.push(id);
    console.log('query',query);
    
    const result = await db.query(query, values);
    return result;
};

exports.deleteSearchSuggestionsById = async (id) => {
    return await db.query(`DELETE FROM tbl_searchsuggestions where id=?`, [id]);
};