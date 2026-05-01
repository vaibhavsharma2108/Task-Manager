const resolveConflict = (oldDescription, newDescription) => {
    try {
        
        const mergedDescription = oldDescription + "\n\n" + newDescription;

        return mergedDescription;
    } catch (error) {
        console.error("Error resolving conflict:", error);
        return oldDescription;
    }
};
export default resolveConflict;