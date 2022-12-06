function createElemWithText(tag = 'p', text = '', classes = '') {
    const node = document.createElement(tag);
    node.innerHTML = text;
    node.className = classes;
    return node;
  }
  
  
  
function createSelectOptions(jsonData) {
    if(!jsonData) {
        return;
    }

    const optionsArray = [];
    for(const user of jsonData) {
        const option = createElemWithText('option',user.name);
        option.value = user.id;
        optionsArray.push(option);
    }
    return optionsArray;
}



function toggleCommentSection(postId) {
    if(postId===undefined) {
        return;
    }
  
    const section = document.querySelector(`section[data-post-id='${postId}']`);
    if(section) {
        section.classList.toggle('hide');
    }
    return section;
}



function toggleCommentButton(postId) {
    if(postId===undefined) {
        return;
    }
    
    const button = document.querySelector(`button[data-post-id='${postId}']`);
    if(button) {
        (button.textContent==='Show Comments') ?
        button.textContent = 'Hide Comments':
        button.textContent = 'Show Comments';
    }
    return button;
}



function deleteChildElements(parentElement) {
    if(!parentElement || !(parentElement instanceof HTMLElement)) {
        return;
    }
    
    let child = parentElement.lastElementChild;
    while(child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}



function addButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    if(buttons) {
        for(const button of buttons){
            const postId = button.dataset.postId;
            button.addEventListener('click',(event)=>{
                toggleComments(event,postId);
            });
        }
    }
    return buttons;
}



function removeButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    for(const button of buttons){
        const postId = button.dataset.postId;
        button.removeEventListener('click',(event)=>{
            toggleComments(event,postId);
        });
    }
    return buttons;
}



function createComments(jsonData) {
    if(!jsonData) {
        return;
    }

    const fragment = new DocumentFragment();
    for(const comment of jsonData) {
        const article = document.createElement('article');
        article.append(createElemWithText('h3',comment.name));
        article.append(createElemWithText('p',comment.body));
        article.append(createElemWithText('p',`From: ${comment.email}`));
        fragment.append(article);
    }
    return fragment;
}



function populateSelectMenu(jsonData) {
    if(!jsonData) {
        return;
    }

    const selectMenu = document.getElementById('selectMenu');
    const optionsArray = createSelectOptions(jsonData);

    if(selectMenu && optionsArray) {
        for(const option of optionsArray) {
            selectMenu.append(option);
        }
    }
    return selectMenu;
}



async function getUsers() {
    try {
        const jsonData = await fetch(`https://jsonplaceholder.typicode.com/users`, {headers:{method:'GET'}});
        return await jsonData.json();
    } catch(e) {console.warn('getUsers() fetch request failed: ', e)}
}



async function getUserPosts(userID) {
    if(userID===undefined){
        return;
    }

    try {
        const jsonData = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userID}`, {headers:{method:'GET'}});
        return await jsonData.json();
    } catch(e) {console.warn('getUserPosts() fetch request failed: ', e)}
}



async function getUser(userID) {
    if(userID===undefined){
        return;
    }

    try {
        const jsonData = await fetch(`https://jsonplaceholder.typicode.com/users?id=${userID}`, {headers:{method:'GET'}});
        const data = await jsonData.json();
        return data[0];
    } catch(e) {console.warn('getUser() fetch request failed: ', e)}
}



async function getPostComments(postId) {
    if(postId===undefined) {
        return;
    }

    try {
        const jsonData = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`, {headers:{method:'GET'}});
        return await jsonData.json();
    } catch(e) {console.warn('getPostComments() fet request failed: ', e)}
}



async function displayComments(postId) {
    if(postId===undefined) {
        return;
    }

    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.className = 'comments hide';
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.append(fragment);
    return section;
}



async function createPosts(jsonData) {
    if(!jsonData) {
        return;
    }

    const fragment = new DocumentFragment();
    for(const post of jsonData) {
        const article = document.createElement('article');
        article.append(createElemWithText('h2',post.title));
        article.append(createElemWithText('p',post.body));
        article.append(createElemWithText('p',`Post ID: ${post.id}`));
        const author = await getUser(post.userId);
        article.append(createElemWithText('p',`Author: ${author.name} with ${author.company.name}`));
        article.append(createElemWithText('p',author.company.catchPhrase));
        const button = createElemWithText('button','Show Comments');
        button.dataset.postId = post.id;
        article.append(button);
        const section = await displayComments(post.id);
        article.append(section);
        fragment.append(article);
    }
    return fragment;
}



async function displayPosts(posts) {
    const main = document.querySelector('main');
    const element = posts? 
        await createPosts(posts): 
        createElemWithText('p','Select an Employee to display their posts.','default-text');
    main.append(element);
    return element;
}



function toggleComments(event,postId) {
    if(!event || postId===undefined) {
        return;
    }

    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
}



async function refreshPosts(jsonData) {
    if(!jsonData) {
        return;
    }

    const removedButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector('main'));
    const fragment = await displayPosts(jsonData);
    const addedButtons = addButtonListeners();
    return [removedButtons, main, fragment, addedButtons];
}



async function selectMenuChangeEventHandler(event) {
    if(!event) {
        return;
    }

    const selectMenu = document.getElementById('selectMenu');
    selectMenu.disabled = true;
    const userId = event.target?.value ? event.target.value : 1;
    const posts = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(posts);
    selectMenu.disabled = false;
    return [userId, posts, refreshPostsArray];
}



async function initPage() {
    const users = await getUsers();
    const select = populateSelectMenu(users);
    return [users,select];
}



async function initApp() {
    initPage();
    const selectMenu = document.getElementById('selectMenu');
    selectMenu.addEventListener('change',selectMenuChangeEventHandler);
}



document.addEventListener('DOMContentLoaded',initApp);