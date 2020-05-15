
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self$1(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const urlEncode64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    class Component {
      constructor(facing = 0, locked = false) {
        this.facing = facing;
        this.locked = locked;
      }

      flip() {
        this.facing = (this.facing + 1) % 2;
      }

      handleMarble(entry) {
        // Determines the direction the marble will leave a component given it's direction of entry.
        return this.facing * 2 - 1;
      }

      get name() {
        return this.constructor.name;
      }

      get requiresSlot() {
        return this.constructor.requiresSlot;
      }

      get stopsMarble() {
        return this.constructor.stopsMarble;
      }

      get flipsOnMarble() {
        return this.constructor.flipsOnMarble;
      }

      get flipsNeighbors() {
        return this.constructor.flipsNeighbors;
      }

    }

    _defineProperty(Component, "requiresSlot", true);

    class SymetricalComponent extends Component {
      constructor(facing = 0, locked = false) {
        super(0, locked);
      }

      flip() {}

    }

    class Ramp extends Component {}

    _defineProperty(Ramp, "name", 'ramp');

    _defineProperty(Ramp, "code", [52, 53]);

    class Bit extends Component {}

    _defineProperty(Bit, "name", 'bit');

    _defineProperty(Bit, "code", [54, 55]);

    _defineProperty(Bit, "flipsOnMarble", true);

    class GearBit extends Component {}

    _defineProperty(GearBit, "name", 'gearbit');

    _defineProperty(GearBit, "code", [56, 57]);

    _defineProperty(GearBit, "flipsOnMarble", true);

    _defineProperty(GearBit, "flipsNeighbors", true);

    class Crossover extends SymetricalComponent {
      handleMarble(entry) {
        return entry;
      }

    }

    _defineProperty(Crossover, "name", 'crossover');

    _defineProperty(Crossover, "code", [58]);

    class Interceptor extends SymetricalComponent {}

    _defineProperty(Interceptor, "name", 'interceptor');

    _defineProperty(Interceptor, "code", [59]);

    _defineProperty(Interceptor, "stopsMarble", true);

    class Gear extends Component {
      handleMarble(entry) {
        return false;
      }

    }

    _defineProperty(Gear, "requiresSlot", false);

    _defineProperty(Gear, "name", 'gear');

    _defineProperty(Gear, "code", [60, 61]);

    _defineProperty(Gear, "flipsNeighbors", true);

    const partsList = [Ramp, Bit, Crossover, Interceptor, GearBit, Gear]; // Svelte store for parts

    const parts = writable(partsList);

    parts.encode = function () {
      // URL encode the parts list as a string of identifying part codes followed by their count.
      let $parts = get_store_value(this);
      return $parts.filter(part => typeof part.count !== "undefined" && part.count >= 0 && part.count <= 50).map(part => urlEncode64[part.code[0]] + urlEncode64[part.count]).join('');
    };

    parts.decode = function (code) {
      // Decodes URL encoded string containing part code/count pairs.
      this.update($parts => {
        $parts.forEach(part => {
          if (code) {
            let marker = code.indexOf(urlEncode64[part.code[0]]);
            if (marker > 0 && marker + 1 < code.length) part.count = urlEncode64.indexOf(code[marker + 1]);else part.count = Infinity;
          } else part.count = Infinity;
        });
        return $parts;
      });
    };

    class Board extends Array {
      constructor(boardArray) {
        super(...boardArray);
      }

      async startRun(marble, start = 'left', onTick = () => {}) {
        // Advances a marble through the board from the given starting position.
        // Calls onTick every time the marble advances by a row.
        // Returns object containing the marble, and the side it exited from.
        if (this.marble) return false;
        this.marble = marble;
        this.position = {
          x: start === 'left' ? 3 : 7,
          y: -1
        };
        this.direction = start === 'left' ? 1 : -1;
        let result;
        await onTick();
        this.position.y++;
        await onTick();

        while (this.marble && this.tick()) {
          if (this.position.y === 11) result = {
            marble: this.marble,
            side: this.direction > 0 ? 'right' : 'left'
          };else if (this.position.y === 10 && this.position.x != 5) result = {
            marble: this.marble,
            side: this.position.x > 5 ? 'right' : 'left'
          };else await onTick();

          if (result) {
            this.marble = false;
            return result;
          }
        }

        return false;
      }

      tick() {
        // Advances the marble's position through the board, based on part at its current position.
        if (this.marble) {
          let result = false;
          let part = this[this.position.y][this.position.x];

          if (part) {
            if (part.stopsMarble) return false;
            result = part.handleMarble(this.direction);
            if (part.flipsOnMarble) this.flip(this.position.x, this.position.y);
            if (result) this.position = {
              x: this.position.x + result,
              y: this.position.y + 1
            };
            if (this.position.x < 0 && this.position.x > this[0].length) result = false;
          }

          if (result === false) {
            this.marble = false;
            throw `Marble has escaped at ${this.position.x}, ${this.position.y}!`;
          }

          this.direction = result;
          return true;
        }
      }

      at(x, y) {
        // Returns contents of array at x and y.
        if (x >= 0 && x < this[0].length && y >= 0 && y < this.length) return this[y][x];else return false;
      }

      isValid(x, y) {
        // Returns true for positions on the 11x11 grid that can be used.
        if (y === 0 && (x < 2 || x > 8 || x === 5)) return false;else if (y === 1 && (x === 0 || x === 10)) return false;else if (y === 10 && x != 5) return false;else return true;
      }

      hasSlot(x, y) {
        // Returns true if a positon should have a slot (every other position).
        return Boolean((x + y) % 2);
      }

      flipableNeighbors(partX, partY) {
        // Returns a set containing all contiguous parts that can be flipped by the part at x, y.
        let part = this.at(partX, partY);
        let partsToFlip = new Set();

        if (part) {
          partsToFlip.add(part);

          if (part.flipsNeighbors) {
            const adjacent = (x, y) => {
              let adjacentPositions = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(pos => [pos[0] + x, pos[1] + y]);
              let adjacentFlippingPositions = adjacentPositions.filter(pos => {
                let partAtPos = this.at(...pos);
                return partAtPos && partAtPos.flipsNeighbors && !partsToFlip.has(partAtPos);
              });
              adjacentFlippingPositions.forEach(pos => partsToFlip.add(this.at(...pos)));
              adjacentFlippingPositions.forEach(pos => adjacent(...pos));
            };

            adjacent(partX, partY);
          }
        }

        return partsToFlip;
      }

      flip(x, y) {
        // Flips the part at x, y, and all contiguous parts that can be flipped.
        this.flipableNeighbors(x, y).forEach(part => part.flip());
      }

      encode() {
        // Returns a base64 encoded version of the board.
        let encodedBoard = '';
        this.forEach(row => {
          for (let position = 0; position < row.length; position++) {
            if (!row[position]) {
              let restOfRow = row.slice(position + 1);
              let numberOfBlanks = restOfRow.findIndex(part => part);
              if (numberOfBlanks < 0) numberOfBlanks = restOfRow.length;
              encodedBoard += urlEncode64[numberOfBlanks];
              position += numberOfBlanks;
            } else {
              encodedBoard += urlEncode64[row[position].constructor.code[row[position].facing]];
              if (row[position].locked) encodedBoard += urlEncode64[62];
            }
          }
        });
        return encodedBoard;
      }

      static create(boardCode = null) {
        // Recreates a board from code if provided, else returns an empty board.
        let board = [...Array(11)];

        if (boardCode) {
          if (!/^[a-zA-Z0-9-_]*$/.test(boardCode)) throw 'Code is not base64 url encoded!';else if (boardCode.length < 11) throw 'Code is too short!';else {
            let position = 0;
            let boardLocked = false;

            if (urlEncode64.indexOf(boardCode[0]) == 62) {
              boardLocked = true;
              position = 1;
            }

            board = board.map(() => {
              let row = [];

              while (row.length < 11 && position < boardCode.length) {
                let code = urlEncode64.indexOf(boardCode[position]);
                if (code < 11) row.push(...Array(code + 1));else {
                  let partClass = partsList.find(part => part.code.includes(code));

                  if (partClass) {
                    let locked = position + 1 < boardCode.length && boardCode[position + 1] === urlEncode64[62];
                    row.push(new partClass(partClass.code.indexOf(code), boardLocked || locked));
                    if (locked) position++;
                  } else throw 'Invalid code! ' + code + ' @ position ' + position;
                }
                position++;
              }

              return row;
            });
          }
        } else board = board.map(() => Array(11));

        return new Board(board);
      }

    } // Svelte store for board data, with encode and decode shortcuts.

    const board = writable(Board.create());

    board.encode = function () {
      return get_store_value(this).encode();
    };

    board.decode = function (code) {
      try {
        this.set(Board.create(code));
      } catch (err) {
        console.log(err);
        console.log('Initializing empty board');
        this.set(Board.create());
      }
    };

    const holding = writable(false);
    const rooms = writable(false);
    const currentChallenge = writable(false);
    const toastMessage = writable(false);
    const basePath = writable(window.location.pathname.endsWith('room/') || window.location.pathname.endsWith('about/') ? '../' : './');

    basePath.update = function () {
      // Sets the base path to the relative path given the current location.
      this.set(window.location.pathname.endsWith('room/') || window.location.pathname.endsWith('room') || window.location.pathname.endsWith('about/') || window.location.pathname.endsWith('about') || window.location.pathname.endsWith('about/index.html') ? '../' : './');
    };

    /* src/svelte/MarbleTray.svelte generated by Svelte v3.20.1 */
    const file = "src/svelte/MarbleTray.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (15:2) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/marble" + /*marble*/ ctx[4].color + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*marble*/ ctx[4].color + " marble"));
    			attr_dev(img, "class", "svelte-926an8");
    			add_location(img, file, 15, 4, 449);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath, marbles*/ 9 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/marble" + /*marble*/ ctx[4].color + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*marbles*/ 1 && img_alt_value !== (img_alt_value = "" + (/*marble*/ ctx[4].color + " marble"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(15:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#if result}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let img_intro;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/marble" + /*marble*/ ctx[4].color + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "" + (/*marble*/ ctx[4].color + " marble"));
    			attr_dev(img, "class", "svelte-926an8");
    			add_location(img, file, 12, 4, 308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath, marbles*/ 9 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/marble" + /*marble*/ ctx[4].color + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*marbles*/ 1 && img_alt_value !== (img_alt_value = "" + (/*marble*/ ctx[4].color + " marble"))) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: function intro(local) {
    			if (!img_intro) {
    				add_render_callback(() => {
    					img_intro = create_in_transition(img, fly, { x: -200, duration: 600 });
    					img_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(12:2) {#if result}",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#each marbles as marble, i (i)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*result*/ ctx[2]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(11:2) {#each marbles as marble, i (i)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*marbles*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*i*/ ctx[6];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "marble-tray");
    			attr_dev(div, "class", "svelte-926an8");
    			toggle_class(div, "right", /*direction*/ ctx[1] === "right");
    			add_location(div, file, 9, 0, 195);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$basePath, marbles, result*/ 13) {
    				const each_value = /*marbles*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}

    			if (dirty & /*direction*/ 2) {
    				toggle_class(div, "right", /*direction*/ ctx[1] === "right");
    			}
    		},
    		i: function intro(local) {
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $basePath;
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, $$value => $$invalidate(3, $basePath = $$value));
    	let { marbles = [] } = $$props;
    	let { direction = "left" } = $$props;
    	let { result = false } = $$props;
    	const writable_props = ["marbles", "direction", "result"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MarbleTray> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MarbleTray", $$slots, []);

    	$$self.$set = $$props => {
    		if ("marbles" in $$props) $$invalidate(0, marbles = $$props.marbles);
    		if ("direction" in $$props) $$invalidate(1, direction = $$props.direction);
    		if ("result" in $$props) $$invalidate(2, result = $$props.result);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		basePath,
    		marbles,
    		direction,
    		result,
    		$basePath
    	});

    	$$self.$inject_state = $$props => {
    		if ("marbles" in $$props) $$invalidate(0, marbles = $$props.marbles);
    		if ("direction" in $$props) $$invalidate(1, direction = $$props.direction);
    		if ("result" in $$props) $$invalidate(2, result = $$props.result);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [marbles, direction, result, $basePath];
    }

    class MarbleTray extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { marbles: 0, direction: 1, result: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MarbleTray",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get marbles() {
    		throw new Error("<MarbleTray>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set marbles(value) {
    		throw new Error("<MarbleTray>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get direction() {
    		throw new Error("<MarbleTray>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<MarbleTray>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get result() {
    		throw new Error("<MarbleTray>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set result(value) {
    		throw new Error("<MarbleTray>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte/Modal.svelte generated by Svelte v3.20.1 */
    const file$1 = "src/svelte/Modal.svelte";

    // (18:0) {#if visible}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let header;
    	let h2;
    	let t0;
    	let t1;
    	let button;
    	let t3;
    	let div0_transition;
    	let div1_transition;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			header = element("header");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			button = element("button");
    			button.textContent = "X";
    			t3 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(h2, "class", "svelte-1sswz57");
    			add_location(h2, file$1, 21, 6, 502);
    			attr_dev(button, "class", "close-modal svelte-1sswz57");
    			add_location(button, file$1, 22, 6, 525);
    			attr_dev(header, "class", "svelte-1sswz57");
    			add_location(header, file$1, 20, 4, 487);
    			attr_dev(div0, "class", "modal svelte-1sswz57");
    			add_location(div0, file$1, 19, 2, 417);
    			attr_dev(div1, "class", "cover svelte-1sswz57");
    			toggle_class(div1, "fading", !/*visible*/ ctx[0]);
    			add_location(div1, file$1, 18, 0, 313);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, header);
    			append_dev(header, h2);
    			append_dev(h2, t0);
    			append_dev(header, t1);
    			append_dev(header, button);
    			append_dev(div0, t3);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "click", /*closeModal*/ ctx[2], false, false, false),
    				listen_dev(div1, "click", self$1(prevent_default(/*closeModal*/ ctx[2])), false, true, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    				}
    			}

    			if (dirty & /*visible*/ 1) {
    				toggle_class(div1, "fading", !/*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fly, { y: -300, duration: 600 }, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fly, { y: -300, duration: 600 }, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching && div1_transition) div1_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(18:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { visible = false } = $$props;
    	let { title = "Modal" } = $$props;
    	const dispatch = createEventDispatcher();

    	function closeModal() {
    		$$invalidate(0, visible = false);
    		dispatch("close");
    	}

    	const writable_props = ["visible", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		createEventDispatcher,
    		visible,
    		title,
    		dispatch,
    		closeModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, title, closeModal, dispatch, $$scope, $$slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { visible: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get visible() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte/NumbersModal.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/svelte/NumbersModal.svelte";

    // (63:6) {#if infinity}
    function create_if_block$2(ctx) {
    	let div;
    	let button;
    	let span;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			span = element("span");
    			span.textContent = "∞";
    			attr_dev(span, "class", "svelte-1t7zbiz");
    			add_location(span, file$2, 64, 64, 1801);
    			attr_dev(button, "class", "infinity svelte-1t7zbiz");
    			add_location(button, file$2, 64, 8, 1745);
    			attr_dev(div, "class", "infinity-button");
    			add_location(div, file$2, 63, 6, 1707);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, span);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[17], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(63:6) {#if infinity}",
    		ctx
    	});

    	return block;
    }

    // (53:0) <Modal {title} bind:visible>
    function create_default_slot(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let button0;
    	let form;
    	let input_1;
    	let button1;
    	let t3;
    	let t4;
    	let div4;
    	let button2;
    	let t6;
    	let button3;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
    	let if_block = /*infinity*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "-";
    			form = element("form");
    			input_1 = element("input");
    			button1 = element("button");
    			button1.textContent = "+";
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			div4 = element("div");
    			button2 = element("button");
    			button2.textContent = "OK";
    			t6 = space();
    			button3 = element("button");
    			button3.textContent = "Cancel";
    			add_location(div0, file$2, 54, 4, 1247);
    			attr_dev(button0, "class", "decrease svelte-1t7zbiz");
    			add_location(button0, file$2, 59, 8, 1335);
    			attr_dev(input_1, "maxlength", "2");
    			attr_dev(input_1, "type", "text");
    			attr_dev(input_1, "class", "svelte-1t7zbiz");
    			toggle_class(input_1, "infinity", /*input*/ ctx[3] === "∞");
    			add_location(input_1, file$2, 59, 99, 1426);
    			attr_dev(form, "class", "svelte-1t7zbiz");
    			add_location(form, file$2, 59, 63, 1390);
    			attr_dev(button1, "class", "increase svelte-1t7zbiz");
    			add_location(button1, file$2, 60, 44, 1595);
    			attr_dev(div1, "class", "number-input svelte-1t7zbiz");
    			add_location(div1, file$2, 58, 6, 1300);
    			add_location(div2, file$2, 57, 4, 1288);
    			attr_dev(div3, "class", "container svelte-1t7zbiz");
    			add_location(div3, file$2, 53, 2, 1219);
    			add_location(button2, file$2, 70, 4, 1904);
    			add_location(button3, file$2, 70, 38, 1938);
    			attr_dev(div4, "class", "confirm svelte-1t7zbiz");
    			add_location(div4, file$2, 69, 2, 1878);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, form);
    			append_dev(form, input_1);
    			set_input_value(input_1, /*input*/ ctx[3]);
    			/*input_1_binding*/ ctx[16](input_1);
    			append_dev(div1, button1);
    			append_dev(div2, t3);
    			if (if_block) if_block.m(div2, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, button2);
    			append_dev(div4, t6);
    			append_dev(div4, button3);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*decrease*/ ctx[6], false, false, false),
    				listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[15]),
    				listen_dev(input_1, "input", /*onInput*/ ctx[8], false, false, false),
    				listen_dev(input_1, "beforeinput", /*beforeInput*/ ctx[7], false, false, false),
    				listen_dev(form, "submit", prevent_default(/*ok*/ ctx[10]), false, true, false),
    				listen_dev(button1, "click", prevent_default(/*increase*/ ctx[5]), false, true, false),
    				listen_dev(button2, "click", /*ok*/ ctx[10], false, false, false),
    				listen_dev(button3, "click", /*cancel*/ ctx[9], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[19], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null));
    				}
    			}

    			if (dirty & /*input*/ 8 && input_1.value !== /*input*/ ctx[3]) {
    				set_input_value(input_1, /*input*/ ctx[3]);
    			}

    			if (dirty & /*input*/ 8) {
    				toggle_class(input_1, "infinity", /*input*/ ctx[3] === "∞");
    			}

    			if (/*infinity*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			/*input_1_binding*/ ctx[16](null);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(53:0) <Modal {title} bind:visible>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let updating_visible;
    	let current;

    	function modal_visible_binding(value) {
    		/*modal_visible_binding*/ ctx[18].call(null, value);
    	}

    	let modal_props = {
    		title: /*title*/ ctx[2],
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[0] !== void 0) {
    		modal_props.visible = /*visible*/ ctx[0];
    	}

    	const modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "visible", modal_visible_binding));

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*title*/ 4) modal_changes.title = /*title*/ ctx[2];

    			if (dirty & /*$$scope, input, infinity, inputElement*/ 524314) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 1) {
    				updating_visible = true;
    				modal_changes.visible = /*visible*/ ctx[0];
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { number = 0 } = $$props;
    	let { max = 50 } = $$props;
    	let { infinity = true } = $$props;
    	let { title } = $$props;
    	let { visible = false } = $$props;
    	let input;
    	let inputElement;
    	const dispatch = createEventDispatcher();

    	function increase() {
    		if (input !== "∞" && parseInt(input) < max) $$invalidate(3, input = parseInt(input) + 1); else if (infinity) $$invalidate(3, input = "∞"); else $$invalidate(3, input = max);
    	}

    	function decrease() {
    		if (input !== "∞") $$invalidate(3, input = Math.max(0, parseInt(input) - 1)); else $$invalidate(3, input = max);
    	}

    	function beforeInput(e) {
    		if (e.data !== null) {
    			const newData = e.data.replace(/[^0-9]/, "");
    			if (newData === "") e.preventDefault();
    			if (input === "∞") $$invalidate(3, input = "");
    		}
    	}

    	function onInput(e) {
    		if (input === "") $$invalidate(3, input = "0");
    		$$invalidate(3, input = Math.max(0, parseInt(input)));
    		if (input > max) $$invalidate(3, input = infinity ? "∞" : max);
    	}

    	function cancel() {
    		$$invalidate(0, visible = false);
    		$$invalidate(3, input = number);
    	}

    	function ok() {
    		dispatch("update", input === "∞" ? Infinity : parseInt(input));
    		$$invalidate(0, visible = false);
    	}

    	const writable_props = ["number", "max", "infinity", "title", "visible"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NumbersModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NumbersModal", $$slots, ['default']);

    	function input_1_input_handler() {
    		input = this.value;
    		($$invalidate(3, input), $$invalidate(11, number));
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, inputElement = $$value);
    		});
    	}

    	const click_handler = () => $$invalidate(3, input = "∞");

    	function modal_visible_binding(value) {
    		visible = value;
    		$$invalidate(0, visible);
    	}

    	$$self.$set = $$props => {
    		if ("number" in $$props) $$invalidate(11, number = $$props.number);
    		if ("max" in $$props) $$invalidate(12, max = $$props.max);
    		if ("infinity" in $$props) $$invalidate(1, infinity = $$props.infinity);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("$$scope" in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Modal,
    		createEventDispatcher,
    		tick,
    		number,
    		max,
    		infinity,
    		title,
    		visible,
    		input,
    		inputElement,
    		dispatch,
    		increase,
    		decrease,
    		beforeInput,
    		onInput,
    		cancel,
    		ok
    	});

    	$$self.$inject_state = $$props => {
    		if ("number" in $$props) $$invalidate(11, number = $$props.number);
    		if ("max" in $$props) $$invalidate(12, max = $$props.max);
    		if ("infinity" in $$props) $$invalidate(1, infinity = $$props.infinity);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("input" in $$props) $$invalidate(3, input = $$props.input);
    		if ("inputElement" in $$props) $$invalidate(4, inputElement = $$props.inputElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*number*/ 2048) {
    			 $$invalidate(3, input = number === Infinity ? "∞" : number);
    		}
    	};

    	return [
    		visible,
    		infinity,
    		title,
    		input,
    		inputElement,
    		increase,
    		decrease,
    		beforeInput,
    		onInput,
    		cancel,
    		ok,
    		number,
    		max,
    		dispatch,
    		$$slots,
    		input_1_input_handler,
    		input_1_binding,
    		click_handler,
    		modal_visible_binding,
    		$$scope
    	];
    }

    class NumbersModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			number: 11,
    			max: 12,
    			infinity: 1,
    			title: 2,
    			visible: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumbersModal",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[2] === undefined && !("title" in props)) {
    			console.warn("<NumbersModal> was created without expected prop 'title'");
    		}
    	}

    	get number() {
    		throw new Error("<NumbersModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<NumbersModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<NumbersModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<NumbersModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get infinity() {
    		throw new Error("<NumbersModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set infinity(value) {
    		throw new Error("<NumbersModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<NumbersModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<NumbersModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<NumbersModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<NumbersModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class Marble {
      constructor() {}

      get color() {
        return this.constructor.color;
      }

    }

    class BlueMarble extends Marble {}

    _defineProperty(BlueMarble, "color", 'blue');

    class RedMarble extends Marble {}

    _defineProperty(RedMarble, "color", 'red');

    const marbles = writable({
      numbers: {
        left: 8,
        right: 8
      },
      edit: {}
    });

    marbles.reset = function (left, right) {
      // Removes marbles from the board, and refills the left and right marble trays.
      // Updates the number of marbles, if set.
      board.update($board => {
        if ($board.marble) {
          $board.marble = false;
          $board.position = false;
        }

        return $board;
      });
      this.update($marbles => {
        if (typeof left !== "undefined" && typeof right !== "undefined") $marbles.numbers = {
          left,
          right
        };
        $marbles.results = [];
        $marbles.left = [...Array($marbles.numbers.left)].map(i => new BlueMarble());
        $marbles.right = [...Array($marbles.numbers.right)].map(i => new RedMarble());
        return $marbles;
      });
    };

    marbles.encode = function () {
      // Returns an URL encoded string of the numbers of marbles for left and right
      let $marbles = get_store_value(this);
      return urlEncode64[$marbles.numbers.left] + urlEncode64[$marbles.numbers.right];
    };

    marbles.decode = function (code) {
      if (code) {
        let left = urlEncode64.indexOf(code[0]);
        let right = urlEncode64.indexOf(code[1]);
        if (left <= 20 && right <= 20) this.reset(left, right);
      } else this.reset(8, 8);
    };

    marbles.reset();

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    /**
     * Parses an URI
     *
     * @author Steven Levithan <stevenlevithan.com> (MIT license)
     * @api private
     */

    var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

    var parts$1 = [
        'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
    ];

    var parseuri = function parseuri(str) {
        var src = str,
            b = str.indexOf('['),
            e = str.indexOf(']');

        if (b != -1 && e != -1) {
            str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
        }

        var m = re.exec(str || ''),
            uri = {},
            i = 14;

        while (i--) {
            uri[parts$1[i]] = m[i] || '';
        }

        if (b != -1 && e != -1) {
            uri.source = src;
            uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
            uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
            uri.ipv6uri = true;
        }

        return uri;
    };

    /**
     * Helpers.
     */

    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;

    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */

    var ms = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse(val);
      } else if (type === 'number' && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };

    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y;
        case 'weeks':
        case 'week':
        case 'w':
          return n * w;
        case 'days':
        case 'day':
        case 'd':
          return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + 'd';
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + 'h';
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + 'm';
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + 's';
      }
      return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
      }
      return ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
    }

    /**
     * This is the common logic for both the Node.js and web browser
     * implementations of `debug()`.
     */

    function setup(env) {
    	createDebug.debug = createDebug;
    	createDebug.default = createDebug;
    	createDebug.coerce = coerce;
    	createDebug.disable = disable;
    	createDebug.enable = enable;
    	createDebug.enabled = enabled;
    	createDebug.humanize = ms;

    	Object.keys(env).forEach(key => {
    		createDebug[key] = env[key];
    	});

    	/**
    	* Active `debug` instances.
    	*/
    	createDebug.instances = [];

    	/**
    	* The currently active debug mode names, and names to skip.
    	*/

    	createDebug.names = [];
    	createDebug.skips = [];

    	/**
    	* Map of special "%n" handling functions, for the debug "format" argument.
    	*
    	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
    	*/
    	createDebug.formatters = {};

    	/**
    	* Selects a color for a debug namespace
    	* @param {String} namespace The namespace string for the for the debug instance to be colored
    	* @return {Number|String} An ANSI color code for the given namespace
    	* @api private
    	*/
    	function selectColor(namespace) {
    		let hash = 0;

    		for (let i = 0; i < namespace.length; i++) {
    			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
    			hash |= 0; // Convert to 32bit integer
    		}

    		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    	}
    	createDebug.selectColor = selectColor;

    	/**
    	* Create a debugger with the given `namespace`.
    	*
    	* @param {String} namespace
    	* @return {Function}
    	* @api public
    	*/
    	function createDebug(namespace) {
    		let prevTime;

    		function debug(...args) {
    			// Disabled?
    			if (!debug.enabled) {
    				return;
    			}

    			const self = debug;

    			// Set `diff` timestamp
    			const curr = Number(new Date());
    			const ms = curr - (prevTime || curr);
    			self.diff = ms;
    			self.prev = prevTime;
    			self.curr = curr;
    			prevTime = curr;

    			args[0] = createDebug.coerce(args[0]);

    			if (typeof args[0] !== 'string') {
    				// Anything else let's inspect with %O
    				args.unshift('%O');
    			}

    			// Apply any `formatters` transformations
    			let index = 0;
    			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
    				// If we encounter an escaped % then don't increase the array index
    				if (match === '%%') {
    					return match;
    				}
    				index++;
    				const formatter = createDebug.formatters[format];
    				if (typeof formatter === 'function') {
    					const val = args[index];
    					match = formatter.call(self, val);

    					// Now we need to remove `args[index]` since it's inlined in the `format`
    					args.splice(index, 1);
    					index--;
    				}
    				return match;
    			});

    			// Apply env-specific formatting (colors, etc.)
    			createDebug.formatArgs.call(self, args);

    			const logFn = self.log || createDebug.log;
    			logFn.apply(self, args);
    		}

    		debug.namespace = namespace;
    		debug.enabled = createDebug.enabled(namespace);
    		debug.useColors = createDebug.useColors();
    		debug.color = selectColor(namespace);
    		debug.destroy = destroy;
    		debug.extend = extend;
    		// Debug.formatArgs = formatArgs;
    		// debug.rawLog = rawLog;

    		// env-specific initialization logic for debug instances
    		if (typeof createDebug.init === 'function') {
    			createDebug.init(debug);
    		}

    		createDebug.instances.push(debug);

    		return debug;
    	}

    	function destroy() {
    		const index = createDebug.instances.indexOf(this);
    		if (index !== -1) {
    			createDebug.instances.splice(index, 1);
    			return true;
    		}
    		return false;
    	}

    	function extend(namespace, delimiter) {
    		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
    		newDebug.log = this.log;
    		return newDebug;
    	}

    	/**
    	* Enables a debug mode by namespaces. This can include modes
    	* separated by a colon and wildcards.
    	*
    	* @param {String} namespaces
    	* @api public
    	*/
    	function enable(namespaces) {
    		createDebug.save(namespaces);

    		createDebug.names = [];
    		createDebug.skips = [];

    		let i;
    		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    		const len = split.length;

    		for (i = 0; i < len; i++) {
    			if (!split[i]) {
    				// ignore empty strings
    				continue;
    			}

    			namespaces = split[i].replace(/\*/g, '.*?');

    			if (namespaces[0] === '-') {
    				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    			} else {
    				createDebug.names.push(new RegExp('^' + namespaces + '$'));
    			}
    		}

    		for (i = 0; i < createDebug.instances.length; i++) {
    			const instance = createDebug.instances[i];
    			instance.enabled = createDebug.enabled(instance.namespace);
    		}
    	}

    	/**
    	* Disable debug output.
    	*
    	* @return {String} namespaces
    	* @api public
    	*/
    	function disable() {
    		const namespaces = [
    			...createDebug.names.map(toNamespace),
    			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
    		].join(',');
    		createDebug.enable('');
    		return namespaces;
    	}

    	/**
    	* Returns true if the given mode name is enabled, false otherwise.
    	*
    	* @param {String} name
    	* @return {Boolean}
    	* @api public
    	*/
    	function enabled(name) {
    		if (name[name.length - 1] === '*') {
    			return true;
    		}

    		let i;
    		let len;

    		for (i = 0, len = createDebug.skips.length; i < len; i++) {
    			if (createDebug.skips[i].test(name)) {
    				return false;
    			}
    		}

    		for (i = 0, len = createDebug.names.length; i < len; i++) {
    			if (createDebug.names[i].test(name)) {
    				return true;
    			}
    		}

    		return false;
    	}

    	/**
    	* Convert regexp to namespace
    	*
    	* @param {RegExp} regxep
    	* @return {String} namespace
    	* @api private
    	*/
    	function toNamespace(regexp) {
    		return regexp.toString()
    			.substring(2, regexp.toString().length - 2)
    			.replace(/\.\*\?$/, '*');
    	}

    	/**
    	* Coerce `val`.
    	*
    	* @param {Mixed} val
    	* @return {Mixed}
    	* @api private
    	*/
    	function coerce(val) {
    		if (val instanceof Error) {
    			return val.stack || val.message;
    		}
    		return val;
    	}

    	createDebug.enable(createDebug.load());

    	return createDebug;
    }

    var common = setup;

    var browser = createCommonjsModule(function (module, exports) {
    /* eslint-env browser */

    /**
     * This is the web browser implementation of `debug()`.
     */

    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();

    /**
     * Colors.
     */

    exports.colors = [
    	'#0000CC',
    	'#0000FF',
    	'#0033CC',
    	'#0033FF',
    	'#0066CC',
    	'#0066FF',
    	'#0099CC',
    	'#0099FF',
    	'#00CC00',
    	'#00CC33',
    	'#00CC66',
    	'#00CC99',
    	'#00CCCC',
    	'#00CCFF',
    	'#3300CC',
    	'#3300FF',
    	'#3333CC',
    	'#3333FF',
    	'#3366CC',
    	'#3366FF',
    	'#3399CC',
    	'#3399FF',
    	'#33CC00',
    	'#33CC33',
    	'#33CC66',
    	'#33CC99',
    	'#33CCCC',
    	'#33CCFF',
    	'#6600CC',
    	'#6600FF',
    	'#6633CC',
    	'#6633FF',
    	'#66CC00',
    	'#66CC33',
    	'#9900CC',
    	'#9900FF',
    	'#9933CC',
    	'#9933FF',
    	'#99CC00',
    	'#99CC33',
    	'#CC0000',
    	'#CC0033',
    	'#CC0066',
    	'#CC0099',
    	'#CC00CC',
    	'#CC00FF',
    	'#CC3300',
    	'#CC3333',
    	'#CC3366',
    	'#CC3399',
    	'#CC33CC',
    	'#CC33FF',
    	'#CC6600',
    	'#CC6633',
    	'#CC9900',
    	'#CC9933',
    	'#CCCC00',
    	'#CCCC33',
    	'#FF0000',
    	'#FF0033',
    	'#FF0066',
    	'#FF0099',
    	'#FF00CC',
    	'#FF00FF',
    	'#FF3300',
    	'#FF3333',
    	'#FF3366',
    	'#FF3399',
    	'#FF33CC',
    	'#FF33FF',
    	'#FF6600',
    	'#FF6633',
    	'#FF9900',
    	'#FF9933',
    	'#FFCC00',
    	'#FFCC33'
    ];

    /**
     * Currently only WebKit-based Web Inspectors, Firefox >= v31,
     * and the Firebug extension (any Firefox version) are known
     * to support "%c" CSS customizations.
     *
     * TODO: add a `localStorage` variable to explicitly enable/disable colors
     */

    // eslint-disable-next-line complexity
    function useColors() {
    	// NB: In an Electron preload script, document will be defined but not fully
    	// initialized. Since we know we're in Chrome, we'll just detect this case
    	// explicitly
    	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    		return true;
    	}

    	// Internet Explorer and Edge do not support colors.
    	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    		return false;
    	}

    	// Is webkit? http://stackoverflow.com/a/16459606/376773
    	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    		// Is firebug? http://stackoverflow.com/a/398120/376773
    		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    		// Is firefox >= v31?
    		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    		// Double check webkit in userAgent just in case we are in a worker
    		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }

    /**
     * Colorize log arguments if enabled.
     *
     * @api public
     */

    function formatArgs(args) {
    	args[0] = (this.useColors ? '%c' : '') +
    		this.namespace +
    		(this.useColors ? ' %c' : ' ') +
    		args[0] +
    		(this.useColors ? '%c ' : ' ') +
    		'+' + module.exports.humanize(this.diff);

    	if (!this.useColors) {
    		return;
    	}

    	const c = 'color: ' + this.color;
    	args.splice(1, 0, c, 'color: inherit');

    	// The final "%c" is somewhat tricky, because there could be other
    	// arguments passed either before or after the %c, so we need to
    	// figure out the correct index to insert the CSS into
    	let index = 0;
    	let lastC = 0;
    	args[0].replace(/%[a-zA-Z%]/g, match => {
    		if (match === '%%') {
    			return;
    		}
    		index++;
    		if (match === '%c') {
    			// We only are interested in the *last* %c
    			// (the user may have provided their own)
    			lastC = index;
    		}
    	});

    	args.splice(lastC, 0, c);
    }

    /**
     * Invokes `console.log()` when available.
     * No-op when `console.log` is not a "function".
     *
     * @api public
     */
    function log(...args) {
    	// This hackery is required for IE8/9, where
    	// the `console.log` function doesn't have 'apply'
    	return typeof console === 'object' &&
    		console.log &&
    		console.log(...args);
    }

    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */
    function save(namespaces) {
    	try {
    		if (namespaces) {
    			exports.storage.setItem('debug', namespaces);
    		} else {
    			exports.storage.removeItem('debug');
    		}
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}
    }

    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */
    function load() {
    	let r;
    	try {
    		r = exports.storage.getItem('debug');
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}

    	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    	if (!r && typeof process !== 'undefined' && 'env' in process) {
    		r = process.env.DEBUG;
    	}

    	return r;
    }

    /**
     * Localstorage attempts to return the localstorage.
     *
     * This is necessary because safari throws
     * when a user disables cookies/localstorage
     * and you attempt to access it.
     *
     * @return {LocalStorage}
     * @api private
     */

    function localstorage() {
    	try {
    		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    		// The Browser also has localStorage in the global context.
    		return localStorage;
    	} catch (error) {
    		// Swallow
    		// XXX (@Qix-) should we be logging these?
    	}
    }

    module.exports = common(exports);

    const {formatters} = module.exports;

    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */

    formatters.j = function (v) {
    	try {
    		return JSON.stringify(v);
    	} catch (error) {
    		return '[UnexpectedJSONParseError]: ' + error.message;
    	}
    };
    });
    var browser_1 = browser.log;
    var browser_2 = browser.formatArgs;
    var browser_3 = browser.save;
    var browser_4 = browser.load;
    var browser_5 = browser.useColors;
    var browser_6 = browser.storage;
    var browser_7 = browser.colors;

    /**
     * Module dependencies.
     */


    var debug = browser('socket.io-client:url');

    /**
     * Module exports.
     */

    var url_1 = url;

    /**
     * URL parser.
     *
     * @param {String} url
     * @param {Object} An object meant to mimic window.location.
     *                 Defaults to window.location.
     * @api public
     */

    function url (uri, loc) {
      var obj = uri;

      // default to window.location
      loc = loc || (typeof location !== 'undefined' && location);
      if (null == uri) uri = loc.protocol + '//' + loc.host;

      // relative path support
      if ('string' === typeof uri) {
        if ('/' === uri.charAt(0)) {
          if ('/' === uri.charAt(1)) {
            uri = loc.protocol + uri;
          } else {
            uri = loc.host + uri;
          }
        }

        if (!/^(https?|wss?):\/\//.test(uri)) {
          debug('protocol-less url %s', uri);
          if ('undefined' !== typeof loc) {
            uri = loc.protocol + '//' + uri;
          } else {
            uri = 'https://' + uri;
          }
        }

        // parse
        debug('parse %s', uri);
        obj = parseuri(uri);
      }

      // make sure we treat `localhost:80` and `localhost` equally
      if (!obj.port) {
        if (/^(http|ws)$/.test(obj.protocol)) {
          obj.port = '80';
        } else if (/^(http|ws)s$/.test(obj.protocol)) {
          obj.port = '443';
        }
      }

      obj.path = obj.path || '/';

      var ipv6 = obj.host.indexOf(':') !== -1;
      var host = ipv6 ? '[' + obj.host + ']' : obj.host;

      // define unique id
      obj.id = obj.protocol + '://' + host + ':' + obj.port;
      // define href
      obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

      return obj;
    }

    /**
     * Helpers.
     */

    var s$1 = 1000;
    var m$1 = s$1 * 60;
    var h$1 = m$1 * 60;
    var d$1 = h$1 * 24;
    var y$1 = d$1 * 365.25;

    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */

    var ms$1 = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse$1(val);
      } else if (type === 'number' && isNaN(val) === false) {
        return options.long ? fmtLong$1(val) : fmtShort$1(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };

    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */

    function parse$1(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y$1;
        case 'days':
        case 'day':
        case 'd':
          return n * d$1;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h$1;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m$1;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s$1;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }

    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtShort$1(ms) {
      if (ms >= d$1) {
        return Math.round(ms / d$1) + 'd';
      }
      if (ms >= h$1) {
        return Math.round(ms / h$1) + 'h';
      }
      if (ms >= m$1) {
        return Math.round(ms / m$1) + 'm';
      }
      if (ms >= s$1) {
        return Math.round(ms / s$1) + 's';
      }
      return ms + 'ms';
    }

    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */

    function fmtLong$1(ms) {
      return plural$1(ms, d$1, 'day') ||
        plural$1(ms, h$1, 'hour') ||
        plural$1(ms, m$1, 'minute') ||
        plural$1(ms, s$1, 'second') ||
        ms + ' ms';
    }

    /**
     * Pluralization helper.
     */

    function plural$1(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + ' ' + name;
      }
      return Math.ceil(ms / n) + ' ' + name + 's';
    }

    var debug$1 = createCommonjsModule(function (module, exports) {
    /**
     * This is the common logic for both the Node.js and web browser
     * implementations of `debug()`.
     *
     * Expose `debug()` as the module.
     */

    exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = ms$1;

    /**
     * Active `debug` instances.
     */
    exports.instances = [];

    /**
     * The currently active debug mode names, and names to skip.
     */

    exports.names = [];
    exports.skips = [];

    /**
     * Map of special "%n" handling functions, for the debug "format" argument.
     *
     * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
     */

    exports.formatters = {};

    /**
     * Select a color.
     * @param {String} namespace
     * @return {Number}
     * @api private
     */

    function selectColor(namespace) {
      var hash = 0, i;

      for (i in namespace) {
        hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }

      return exports.colors[Math.abs(hash) % exports.colors.length];
    }

    /**
     * Create a debugger with the given `namespace`.
     *
     * @param {String} namespace
     * @return {Function}
     * @api public
     */

    function createDebug(namespace) {

      var prevTime;

      function debug() {
        // disabled?
        if (!debug.enabled) return;

        var self = debug;

        // set `diff` timestamp
        var curr = +new Date();
        var ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;

        // turn the `arguments` into a proper Array
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }

        args[0] = exports.coerce(args[0]);

        if ('string' !== typeof args[0]) {
          // anything else let's inspect with %O
          args.unshift('%O');
        }

        // apply any `formatters` transformations
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          // if we encounter an escaped % then don't increase the array index
          if (match === '%%') return match;
          index++;
          var formatter = exports.formatters[format];
          if ('function' === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);

            // now we need to remove `args[index]` since it's inlined in the `format`
            args.splice(index, 1);
            index--;
          }
          return match;
        });

        // apply env-specific formatting (colors, etc.)
        exports.formatArgs.call(self, args);

        var logFn = debug.log || exports.log || console.log.bind(console);
        logFn.apply(self, args);
      }

      debug.namespace = namespace;
      debug.enabled = exports.enabled(namespace);
      debug.useColors = exports.useColors();
      debug.color = selectColor(namespace);
      debug.destroy = destroy;

      // env-specific initialization logic for debug instances
      if ('function' === typeof exports.init) {
        exports.init(debug);
      }

      exports.instances.push(debug);

      return debug;
    }

    function destroy () {
      var index = exports.instances.indexOf(this);
      if (index !== -1) {
        exports.instances.splice(index, 1);
        return true;
      } else {
        return false;
      }
    }

    /**
     * Enables a debug mode by namespaces. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} namespaces
     * @api public
     */

    function enable(namespaces) {
      exports.save(namespaces);

      exports.names = [];
      exports.skips = [];

      var i;
      var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
      var len = split.length;

      for (i = 0; i < len; i++) {
        if (!split[i]) continue; // ignore empty strings
        namespaces = split[i].replace(/\*/g, '.*?');
        if (namespaces[0] === '-') {
          exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
        } else {
          exports.names.push(new RegExp('^' + namespaces + '$'));
        }
      }

      for (i = 0; i < exports.instances.length; i++) {
        var instance = exports.instances[i];
        instance.enabled = exports.enabled(instance.namespace);
      }
    }

    /**
     * Disable debug output.
     *
     * @api public
     */

    function disable() {
      exports.enable('');
    }

    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     */

    function enabled(name) {
      if (name[name.length - 1] === '*') {
        return true;
      }
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Coerce `val`.
     *
     * @param {Mixed} val
     * @return {Mixed}
     * @api private
     */

    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
    });
    var debug_1 = debug$1.coerce;
    var debug_2 = debug$1.disable;
    var debug_3 = debug$1.enable;
    var debug_4 = debug$1.enabled;
    var debug_5 = debug$1.humanize;
    var debug_6 = debug$1.instances;
    var debug_7 = debug$1.names;
    var debug_8 = debug$1.skips;
    var debug_9 = debug$1.formatters;

    var browser$1 = createCommonjsModule(function (module, exports) {
    /**
     * This is the web browser implementation of `debug()`.
     *
     * Expose `debug()` as the module.
     */

    exports = module.exports = debug$1;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = 'undefined' != typeof chrome
                   && 'undefined' != typeof chrome.storage
                      ? chrome.storage.local
                      : localstorage();

    /**
     * Colors.
     */

    exports.colors = [
      '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
      '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
      '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
      '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
      '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
      '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
      '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
      '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
      '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
      '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
      '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
    ];

    /**
     * Currently only WebKit-based Web Inspectors, Firefox >= v31,
     * and the Firebug extension (any Firefox version) are known
     * to support "%c" CSS customizations.
     *
     * TODO: add a `localStorage` variable to explicitly enable/disable colors
     */

    function useColors() {
      // NB: In an Electron preload script, document will be defined but not fully
      // initialized. Since we know we're in Chrome, we'll just detect this case
      // explicitly
      if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        return true;
      }

      // Internet Explorer and Edge do not support colors.
      if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }

      // is webkit? http://stackoverflow.com/a/16459606/376773
      // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
      return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
        // is firebug? http://stackoverflow.com/a/398120/376773
        (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
        // is firefox >= v31?
        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
        // double check webkit in userAgent just in case we are in a worker
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }

    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */

    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return '[UnexpectedJSONParseError]: ' + err.message;
      }
    };


    /**
     * Colorize log arguments if enabled.
     *
     * @api public
     */

    function formatArgs(args) {
      var useColors = this.useColors;

      args[0] = (useColors ? '%c' : '')
        + this.namespace
        + (useColors ? ' %c' : ' ')
        + args[0]
        + (useColors ? '%c ' : ' ')
        + '+' + exports.humanize(this.diff);

      if (!useColors) return;

      var c = 'color: ' + this.color;
      args.splice(1, 0, c, 'color: inherit');

      // the final "%c" is somewhat tricky, because there could be other
      // arguments passed either before or after the %c, so we need to
      // figure out the correct index to insert the CSS into
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ('%%' === match) return;
        index++;
        if ('%c' === match) {
          // we only are interested in the *last* %c
          // (the user may have provided their own)
          lastC = index;
        }
      });

      args.splice(lastC, 0, c);
    }

    /**
     * Invokes `console.log()` when available.
     * No-op when `console.log` is not a "function".
     *
     * @api public
     */

    function log() {
      // this hackery is required for IE8/9, where
      // the `console.log` function doesn't have 'apply'
      return 'object' === typeof console
        && console.log
        && Function.prototype.apply.call(console.log, console, arguments);
    }

    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */

    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem('debug');
        } else {
          exports.storage.debug = namespaces;
        }
      } catch(e) {}
    }

    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */

    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch(e) {}

      // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
      if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = process.env.DEBUG;
      }

      return r;
    }

    /**
     * Enable namespaces listed in `localStorage.debug` initially.
     */

    exports.enable(load());

    /**
     * Localstorage attempts to return the localstorage.
     *
     * This is necessary because safari throws
     * when a user disables cookies/localstorage
     * and you attempt to access it.
     *
     * @return {LocalStorage}
     * @api private
     */

    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {}
    }
    });
    var browser_1$1 = browser$1.log;
    var browser_2$1 = browser$1.formatArgs;
    var browser_3$1 = browser$1.save;
    var browser_4$1 = browser$1.load;
    var browser_5$1 = browser$1.useColors;
    var browser_6$1 = browser$1.storage;
    var browser_7$1 = browser$1.colors;

    var componentEmitter = createCommonjsModule(function (module) {
    /**
     * Expose `Emitter`.
     */

    {
      module.exports = Emitter;
    }

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    }
    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
        .push(fn);
      return this;
    };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.once = function(event, fn){
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }

      on.fn = fn;
      this.on(event, on);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.off =
    Emitter.prototype.removeListener =
    Emitter.prototype.removeAllListeners =
    Emitter.prototype.removeEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};

      // all
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };

    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */

    Emitter.prototype.emit = function(event){
      this._callbacks = this._callbacks || {};
      var args = [].slice.call(arguments, 1)
        , callbacks = this._callbacks['$' + event];

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };

    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */

    Emitter.prototype.listeners = function(event){
      this._callbacks = this._callbacks || {};
      return this._callbacks['$' + event] || [];
    };

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */

    Emitter.prototype.hasListeners = function(event){
      return !! this.listeners(event).length;
    };
    });

    var toString = {}.toString;

    var isarray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    var isBuffer = isBuf;

    var withNativeBuffer = typeof Buffer === 'function' && typeof Buffer.isBuffer === 'function';
    var withNativeArrayBuffer = typeof ArrayBuffer === 'function';

    var isView = function (obj) {
      return typeof ArrayBuffer.isView === 'function' ? ArrayBuffer.isView(obj) : (obj.buffer instanceof ArrayBuffer);
    };

    /**
     * Returns true if obj is a buffer or an arraybuffer.
     *
     * @api private
     */

    function isBuf(obj) {
      return (withNativeBuffer && Buffer.isBuffer(obj)) ||
              (withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj)));
    }

    /*global Blob,File*/

    /**
     * Module requirements
     */



    var toString$1 = Object.prototype.toString;
    var withNativeBlob = typeof Blob === 'function' || (typeof Blob !== 'undefined' && toString$1.call(Blob) === '[object BlobConstructor]');
    var withNativeFile = typeof File === 'function' || (typeof File !== 'undefined' && toString$1.call(File) === '[object FileConstructor]');

    /**
     * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
     * Anything with blobs or files should be fed through removeBlobs before coming
     * here.
     *
     * @param {Object} packet - socket.io event packet
     * @return {Object} with deconstructed packet and list of buffers
     * @api public
     */

    var deconstructPacket = function(packet) {
      var buffers = [];
      var packetData = packet.data;
      var pack = packet;
      pack.data = _deconstructPacket(packetData, buffers);
      pack.attachments = buffers.length; // number of binary 'attachments'
      return {packet: pack, buffers: buffers};
    };

    function _deconstructPacket(data, buffers) {
      if (!data) return data;

      if (isBuffer(data)) {
        var placeholder = { _placeholder: true, num: buffers.length };
        buffers.push(data);
        return placeholder;
      } else if (isarray(data)) {
        var newData = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
          newData[i] = _deconstructPacket(data[i], buffers);
        }
        return newData;
      } else if (typeof data === 'object' && !(data instanceof Date)) {
        var newData = {};
        for (var key in data) {
          newData[key] = _deconstructPacket(data[key], buffers);
        }
        return newData;
      }
      return data;
    }

    /**
     * Reconstructs a binary packet from its placeholder packet and buffers
     *
     * @param {Object} packet - event packet with placeholders
     * @param {Array} buffers - binary buffers to put in placeholder positions
     * @return {Object} reconstructed packet
     * @api public
     */

    var reconstructPacket = function(packet, buffers) {
      packet.data = _reconstructPacket(packet.data, buffers);
      packet.attachments = undefined; // no longer useful
      return packet;
    };

    function _reconstructPacket(data, buffers) {
      if (!data) return data;

      if (data && data._placeholder) {
        return buffers[data.num]; // appropriate buffer (should be natural order anyway)
      } else if (isarray(data)) {
        for (var i = 0; i < data.length; i++) {
          data[i] = _reconstructPacket(data[i], buffers);
        }
      } else if (typeof data === 'object') {
        for (var key in data) {
          data[key] = _reconstructPacket(data[key], buffers);
        }
      }

      return data;
    }

    /**
     * Asynchronously removes Blobs or Files from data via
     * FileReader's readAsArrayBuffer method. Used before encoding
     * data as msgpack. Calls callback with the blobless data.
     *
     * @param {Object} data
     * @param {Function} callback
     * @api private
     */

    var removeBlobs = function(data, callback) {
      function _removeBlobs(obj, curKey, containingObject) {
        if (!obj) return obj;

        // convert any blob
        if ((withNativeBlob && obj instanceof Blob) ||
            (withNativeFile && obj instanceof File)) {
          pendingBlobs++;

          // async filereader
          var fileReader = new FileReader();
          fileReader.onload = function() { // this.result == arraybuffer
            if (containingObject) {
              containingObject[curKey] = this.result;
            }
            else {
              bloblessData = this.result;
            }

            // if nothing pending its callback time
            if(! --pendingBlobs) {
              callback(bloblessData);
            }
          };

          fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
        } else if (isarray(obj)) { // handle array
          for (var i = 0; i < obj.length; i++) {
            _removeBlobs(obj[i], i, obj);
          }
        } else if (typeof obj === 'object' && !isBuffer(obj)) { // and object
          for (var key in obj) {
            _removeBlobs(obj[key], key, obj);
          }
        }
      }

      var pendingBlobs = 0;
      var bloblessData = data;
      _removeBlobs(bloblessData);
      if (!pendingBlobs) {
        callback(bloblessData);
      }
    };

    var binary = {
    	deconstructPacket: deconstructPacket,
    	reconstructPacket: reconstructPacket,
    	removeBlobs: removeBlobs
    };

    var socket_ioParser = createCommonjsModule(function (module, exports) {
    /**
     * Module dependencies.
     */

    var debug = browser$1('socket.io-parser');





    /**
     * Protocol version.
     *
     * @api public
     */

    exports.protocol = 4;

    /**
     * Packet types.
     *
     * @api public
     */

    exports.types = [
      'CONNECT',
      'DISCONNECT',
      'EVENT',
      'ACK',
      'ERROR',
      'BINARY_EVENT',
      'BINARY_ACK'
    ];

    /**
     * Packet type `connect`.
     *
     * @api public
     */

    exports.CONNECT = 0;

    /**
     * Packet type `disconnect`.
     *
     * @api public
     */

    exports.DISCONNECT = 1;

    /**
     * Packet type `event`.
     *
     * @api public
     */

    exports.EVENT = 2;

    /**
     * Packet type `ack`.
     *
     * @api public
     */

    exports.ACK = 3;

    /**
     * Packet type `error`.
     *
     * @api public
     */

    exports.ERROR = 4;

    /**
     * Packet type 'binary event'
     *
     * @api public
     */

    exports.BINARY_EVENT = 5;

    /**
     * Packet type `binary ack`. For acks with binary arguments.
     *
     * @api public
     */

    exports.BINARY_ACK = 6;

    /**
     * Encoder constructor.
     *
     * @api public
     */

    exports.Encoder = Encoder;

    /**
     * Decoder constructor.
     *
     * @api public
     */

    exports.Decoder = Decoder;

    /**
     * A socket.io Encoder instance
     *
     * @api public
     */

    function Encoder() {}

    var ERROR_PACKET = exports.ERROR + '"encode error"';

    /**
     * Encode a packet as a single string if non-binary, or as a
     * buffer sequence, depending on packet type.
     *
     * @param {Object} obj - packet object
     * @param {Function} callback - function to handle encodings (likely engine.write)
     * @return Calls callback with Array of encodings
     * @api public
     */

    Encoder.prototype.encode = function(obj, callback){
      debug('encoding packet %j', obj);

      if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
        encodeAsBinary(obj, callback);
      } else {
        var encoding = encodeAsString(obj);
        callback([encoding]);
      }
    };

    /**
     * Encode packet as string.
     *
     * @param {Object} packet
     * @return {String} encoded
     * @api private
     */

    function encodeAsString(obj) {

      // first is type
      var str = '' + obj.type;

      // attachments if we have them
      if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
        str += obj.attachments + '-';
      }

      // if we have a namespace other than `/`
      // we append it followed by a comma `,`
      if (obj.nsp && '/' !== obj.nsp) {
        str += obj.nsp + ',';
      }

      // immediately followed by the id
      if (null != obj.id) {
        str += obj.id;
      }

      // json data
      if (null != obj.data) {
        var payload = tryStringify(obj.data);
        if (payload !== false) {
          str += payload;
        } else {
          return ERROR_PACKET;
        }
      }

      debug('encoded %j as %s', obj, str);
      return str;
    }

    function tryStringify(str) {
      try {
        return JSON.stringify(str);
      } catch(e){
        return false;
      }
    }

    /**
     * Encode packet as 'buffer sequence' by removing blobs, and
     * deconstructing packet into object with placeholders and
     * a list of buffers.
     *
     * @param {Object} packet
     * @return {Buffer} encoded
     * @api private
     */

    function encodeAsBinary(obj, callback) {

      function writeEncoding(bloblessData) {
        var deconstruction = binary.deconstructPacket(bloblessData);
        var pack = encodeAsString(deconstruction.packet);
        var buffers = deconstruction.buffers;

        buffers.unshift(pack); // add packet info to beginning of data list
        callback(buffers); // write all the buffers
      }

      binary.removeBlobs(obj, writeEncoding);
    }

    /**
     * A socket.io Decoder instance
     *
     * @return {Object} decoder
     * @api public
     */

    function Decoder() {
      this.reconstructor = null;
    }

    /**
     * Mix in `Emitter` with Decoder.
     */

    componentEmitter(Decoder.prototype);

    /**
     * Decodes an encoded packet string into packet JSON.
     *
     * @param {String} obj - encoded packet
     * @return {Object} packet
     * @api public
     */

    Decoder.prototype.add = function(obj) {
      var packet;
      if (typeof obj === 'string') {
        packet = decodeString(obj);
        if (exports.BINARY_EVENT === packet.type || exports.BINARY_ACK === packet.type) { // binary packet's json
          this.reconstructor = new BinaryReconstructor(packet);

          // no attachments, labeled binary but no binary data to follow
          if (this.reconstructor.reconPack.attachments === 0) {
            this.emit('decoded', packet);
          }
        } else { // non-binary full packet
          this.emit('decoded', packet);
        }
      } else if (isBuffer(obj) || obj.base64) { // raw binary data
        if (!this.reconstructor) {
          throw new Error('got binary data when not reconstructing a packet');
        } else {
          packet = this.reconstructor.takeBinaryData(obj);
          if (packet) { // received final buffer
            this.reconstructor = null;
            this.emit('decoded', packet);
          }
        }
      } else {
        throw new Error('Unknown type: ' + obj);
      }
    };

    /**
     * Decode a packet String (JSON data)
     *
     * @param {String} str
     * @return {Object} packet
     * @api private
     */

    function decodeString(str) {
      var i = 0;
      // look up type
      var p = {
        type: Number(str.charAt(0))
      };

      if (null == exports.types[p.type]) {
        return error('unknown packet type ' + p.type);
      }

      // look up attachments if type binary
      if (exports.BINARY_EVENT === p.type || exports.BINARY_ACK === p.type) {
        var buf = '';
        while (str.charAt(++i) !== '-') {
          buf += str.charAt(i);
          if (i == str.length) break;
        }
        if (buf != Number(buf) || str.charAt(i) !== '-') {
          throw new Error('Illegal attachments');
        }
        p.attachments = Number(buf);
      }

      // look up namespace (if any)
      if ('/' === str.charAt(i + 1)) {
        p.nsp = '';
        while (++i) {
          var c = str.charAt(i);
          if (',' === c) break;
          p.nsp += c;
          if (i === str.length) break;
        }
      } else {
        p.nsp = '/';
      }

      // look up id
      var next = str.charAt(i + 1);
      if ('' !== next && Number(next) == next) {
        p.id = '';
        while (++i) {
          var c = str.charAt(i);
          if (null == c || Number(c) != c) {
            --i;
            break;
          }
          p.id += str.charAt(i);
          if (i === str.length) break;
        }
        p.id = Number(p.id);
      }

      // look up json data
      if (str.charAt(++i)) {
        var payload = tryParse(str.substr(i));
        var isPayloadValid = payload !== false && (p.type === exports.ERROR || isarray(payload));
        if (isPayloadValid) {
          p.data = payload;
        } else {
          return error('invalid payload');
        }
      }

      debug('decoded %s as %j', str, p);
      return p;
    }

    function tryParse(str) {
      try {
        return JSON.parse(str);
      } catch(e){
        return false;
      }
    }

    /**
     * Deallocates a parser's resources
     *
     * @api public
     */

    Decoder.prototype.destroy = function() {
      if (this.reconstructor) {
        this.reconstructor.finishedReconstruction();
      }
    };

    /**
     * A manager of a binary event's 'buffer sequence'. Should
     * be constructed whenever a packet of type BINARY_EVENT is
     * decoded.
     *
     * @param {Object} packet
     * @return {BinaryReconstructor} initialized reconstructor
     * @api private
     */

    function BinaryReconstructor(packet) {
      this.reconPack = packet;
      this.buffers = [];
    }

    /**
     * Method to be called when binary data received from connection
     * after a BINARY_EVENT packet.
     *
     * @param {Buffer | ArrayBuffer} binData - the raw binary data received
     * @return {null | Object} returns null if more binary data is expected or
     *   a reconstructed packet object if all buffers have been received.
     * @api private
     */

    BinaryReconstructor.prototype.takeBinaryData = function(binData) {
      this.buffers.push(binData);
      if (this.buffers.length === this.reconPack.attachments) { // done with buffer list
        var packet = binary.reconstructPacket(this.reconPack, this.buffers);
        this.finishedReconstruction();
        return packet;
      }
      return null;
    };

    /**
     * Cleans up binary packet reconstruction variables.
     *
     * @api private
     */

    BinaryReconstructor.prototype.finishedReconstruction = function() {
      this.reconPack = null;
      this.buffers = [];
    };

    function error(msg) {
      return {
        type: exports.ERROR,
        data: 'parser error: ' + msg
      };
    }
    });
    var socket_ioParser_1 = socket_ioParser.protocol;
    var socket_ioParser_2 = socket_ioParser.types;
    var socket_ioParser_3 = socket_ioParser.CONNECT;
    var socket_ioParser_4 = socket_ioParser.DISCONNECT;
    var socket_ioParser_5 = socket_ioParser.EVENT;
    var socket_ioParser_6 = socket_ioParser.ACK;
    var socket_ioParser_7 = socket_ioParser.ERROR;
    var socket_ioParser_8 = socket_ioParser.BINARY_EVENT;
    var socket_ioParser_9 = socket_ioParser.BINARY_ACK;
    var socket_ioParser_10 = socket_ioParser.Encoder;
    var socket_ioParser_11 = socket_ioParser.Decoder;

    var hasCors = createCommonjsModule(function (module) {
    /**
     * Module exports.
     *
     * Logic borrowed from Modernizr:
     *
     *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
     */

    try {
      module.exports = typeof XMLHttpRequest !== 'undefined' &&
        'withCredentials' in new XMLHttpRequest();
    } catch (err) {
      // if XMLHttp support is disabled in IE then it will throw
      // when trying to create
      module.exports = false;
    }
    });

    var globalThis_browser = (function () {
      if (typeof self !== 'undefined') {
        return self;
      } else if (typeof window !== 'undefined') {
        return window;
      } else {
        return Function('return this')(); // eslint-disable-line no-new-func
      }
    })();

    // browser shim for xmlhttprequest module




    var xmlhttprequest = function (opts) {
      var xdomain = opts.xdomain;

      // scheme must be same when usign XDomainRequest
      // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
      var xscheme = opts.xscheme;

      // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
      // https://github.com/Automattic/engine.io-client/pull/217
      var enablesXDR = opts.enablesXDR;

      // XMLHttpRequest can be disabled on IE
      try {
        if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCors)) {
          return new XMLHttpRequest();
        }
      } catch (e) { }

      // Use XDomainRequest for IE8 if enablesXDR is true
      // because loading bar keeps flashing when using jsonp-polling
      // https://github.com/yujiosaka/socke.io-ie8-loading-example
      try {
        if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
          return new XDomainRequest();
        }
      } catch (e) { }

      if (!xdomain) {
        try {
          return new globalThis_browser[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
        } catch (e) { }
      }
    };

    /**
     * Gets the keys for an object.
     *
     * @return {Array} keys
     * @api private
     */

    var keys = Object.keys || function keys (obj){
      var arr = [];
      var has = Object.prototype.hasOwnProperty;

      for (var i in obj) {
        if (has.call(obj, i)) {
          arr.push(i);
        }
      }
      return arr;
    };

    var toString$2 = {}.toString;

    var isarray$1 = Array.isArray || function (arr) {
      return toString$2.call(arr) == '[object Array]';
    };

    /* global Blob File */

    /*
     * Module requirements.
     */



    var toString$3 = Object.prototype.toString;
    var withNativeBlob$1 = typeof Blob === 'function' ||
                            typeof Blob !== 'undefined' && toString$3.call(Blob) === '[object BlobConstructor]';
    var withNativeFile$1 = typeof File === 'function' ||
                            typeof File !== 'undefined' && toString$3.call(File) === '[object FileConstructor]';

    /**
     * Module exports.
     */

    var hasBinary2 = hasBinary;

    /**
     * Checks for binary data.
     *
     * Supports Buffer, ArrayBuffer, Blob and File.
     *
     * @param {Object} anything
     * @api public
     */

    function hasBinary (obj) {
      if (!obj || typeof obj !== 'object') {
        return false;
      }

      if (isarray$1(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (hasBinary(obj[i])) {
            return true;
          }
        }
        return false;
      }

      if ((typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj)) ||
        (typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer) ||
        (withNativeBlob$1 && obj instanceof Blob) ||
        (withNativeFile$1 && obj instanceof File)
      ) {
        return true;
      }

      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
        return hasBinary(obj.toJSON(), true);
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
          return true;
        }
      }

      return false;
    }

    /**
     * An abstraction for slicing an arraybuffer even when
     * ArrayBuffer.prototype.slice is not supported
     *
     * @api public
     */

    var arraybuffer_slice = function(arraybuffer, start, end) {
      var bytes = arraybuffer.byteLength;
      start = start || 0;
      end = end || bytes;

      if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

      if (start < 0) { start += bytes; }
      if (end < 0) { end += bytes; }
      if (end > bytes) { end = bytes; }

      if (start >= bytes || start >= end || bytes === 0) {
        return new ArrayBuffer(0);
      }

      var abv = new Uint8Array(arraybuffer);
      var result = new Uint8Array(end - start);
      for (var i = start, ii = 0; i < end; i++, ii++) {
        result[ii] = abv[i];
      }
      return result.buffer;
    };

    var after_1 = after;

    function after(count, callback, err_cb) {
        var bail = false;
        err_cb = err_cb || noop$1;
        proxy.count = count;

        return (count === 0) ? callback() : proxy

        function proxy(err, result) {
            if (proxy.count <= 0) {
                throw new Error('after called too many times')
            }
            --proxy.count;

            // after first error, rest are passed to err_cb
            if (err) {
                bail = true;
                callback(err);
                // future error callbacks will go to error handler
                callback = err_cb;
            } else if (proxy.count === 0 && !bail) {
                callback(null, result);
            }
        }
    }

    function noop$1() {}

    /*! https://mths.be/utf8js v2.1.2 by @mathias */

    var stringFromCharCode = String.fromCharCode;

    // Taken from https://mths.be/punycode
    function ucs2decode(string) {
    	var output = [];
    	var counter = 0;
    	var length = string.length;
    	var value;
    	var extra;
    	while (counter < length) {
    		value = string.charCodeAt(counter++);
    		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
    			// high surrogate, and there is a next character
    			extra = string.charCodeAt(counter++);
    			if ((extra & 0xFC00) == 0xDC00) { // low surrogate
    				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
    			} else {
    				// unmatched surrogate; only append this code unit, in case the next
    				// code unit is the high surrogate of a surrogate pair
    				output.push(value);
    				counter--;
    			}
    		} else {
    			output.push(value);
    		}
    	}
    	return output;
    }

    // Taken from https://mths.be/punycode
    function ucs2encode(array) {
    	var length = array.length;
    	var index = -1;
    	var value;
    	var output = '';
    	while (++index < length) {
    		value = array[index];
    		if (value > 0xFFFF) {
    			value -= 0x10000;
    			output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
    			value = 0xDC00 | value & 0x3FF;
    		}
    		output += stringFromCharCode(value);
    	}
    	return output;
    }

    function checkScalarValue(codePoint, strict) {
    	if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
    		if (strict) {
    			throw Error(
    				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
    				' is not a scalar value'
    			);
    		}
    		return false;
    	}
    	return true;
    }
    /*--------------------------------------------------------------------------*/

    function createByte(codePoint, shift) {
    	return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
    }

    function encodeCodePoint(codePoint, strict) {
    	if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
    		return stringFromCharCode(codePoint);
    	}
    	var symbol = '';
    	if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
    		symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
    	}
    	else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
    		if (!checkScalarValue(codePoint, strict)) {
    			codePoint = 0xFFFD;
    		}
    		symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
    		symbol += createByte(codePoint, 6);
    	}
    	else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
    		symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
    		symbol += createByte(codePoint, 12);
    		symbol += createByte(codePoint, 6);
    	}
    	symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
    	return symbol;
    }

    function utf8encode(string, opts) {
    	opts = opts || {};
    	var strict = false !== opts.strict;

    	var codePoints = ucs2decode(string);
    	var length = codePoints.length;
    	var index = -1;
    	var codePoint;
    	var byteString = '';
    	while (++index < length) {
    		codePoint = codePoints[index];
    		byteString += encodeCodePoint(codePoint, strict);
    	}
    	return byteString;
    }

    /*--------------------------------------------------------------------------*/

    function readContinuationByte() {
    	if (byteIndex >= byteCount) {
    		throw Error('Invalid byte index');
    	}

    	var continuationByte = byteArray[byteIndex] & 0xFF;
    	byteIndex++;

    	if ((continuationByte & 0xC0) == 0x80) {
    		return continuationByte & 0x3F;
    	}

    	// If we end up here, it’s not a continuation byte
    	throw Error('Invalid continuation byte');
    }

    function decodeSymbol(strict) {
    	var byte1;
    	var byte2;
    	var byte3;
    	var byte4;
    	var codePoint;

    	if (byteIndex > byteCount) {
    		throw Error('Invalid byte index');
    	}

    	if (byteIndex == byteCount) {
    		return false;
    	}

    	// Read first byte
    	byte1 = byteArray[byteIndex] & 0xFF;
    	byteIndex++;

    	// 1-byte sequence (no continuation bytes)
    	if ((byte1 & 0x80) == 0) {
    		return byte1;
    	}

    	// 2-byte sequence
    	if ((byte1 & 0xE0) == 0xC0) {
    		byte2 = readContinuationByte();
    		codePoint = ((byte1 & 0x1F) << 6) | byte2;
    		if (codePoint >= 0x80) {
    			return codePoint;
    		} else {
    			throw Error('Invalid continuation byte');
    		}
    	}

    	// 3-byte sequence (may include unpaired surrogates)
    	if ((byte1 & 0xF0) == 0xE0) {
    		byte2 = readContinuationByte();
    		byte3 = readContinuationByte();
    		codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
    		if (codePoint >= 0x0800) {
    			return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
    		} else {
    			throw Error('Invalid continuation byte');
    		}
    	}

    	// 4-byte sequence
    	if ((byte1 & 0xF8) == 0xF0) {
    		byte2 = readContinuationByte();
    		byte3 = readContinuationByte();
    		byte4 = readContinuationByte();
    		codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
    			(byte3 << 0x06) | byte4;
    		if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
    			return codePoint;
    		}
    	}

    	throw Error('Invalid UTF-8 detected');
    }

    var byteArray;
    var byteCount;
    var byteIndex;
    function utf8decode(byteString, opts) {
    	opts = opts || {};
    	var strict = false !== opts.strict;

    	byteArray = ucs2decode(byteString);
    	byteCount = byteArray.length;
    	byteIndex = 0;
    	var codePoints = [];
    	var tmp;
    	while ((tmp = decodeSymbol(strict)) !== false) {
    		codePoints.push(tmp);
    	}
    	return ucs2encode(codePoints);
    }

    var utf8 = {
    	version: '2.1.2',
    	encode: utf8encode,
    	decode: utf8decode
    };

    var base64Arraybuffer = createCommonjsModule(function (module, exports) {
    /*
     * base64-arraybuffer
     * https://github.com/niklasvh/base64-arraybuffer
     *
     * Copyright (c) 2012 Niklas von Hertzen
     * Licensed under the MIT license.
     */
    (function(){

      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

      // Use a lookup table to find the index.
      var lookup = new Uint8Array(256);
      for (var i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
      }

      exports.encode = function(arraybuffer) {
        var bytes = new Uint8Array(arraybuffer),
        i, len = bytes.length, base64 = "";

        for (i = 0; i < len; i+=3) {
          base64 += chars[bytes[i] >> 2];
          base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
          base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
          base64 += chars[bytes[i + 2] & 63];
        }

        if ((len % 3) === 2) {
          base64 = base64.substring(0, base64.length - 1) + "=";
        } else if (len % 3 === 1) {
          base64 = base64.substring(0, base64.length - 2) + "==";
        }

        return base64;
      };

      exports.decode =  function(base64) {
        var bufferLength = base64.length * 0.75,
        len = base64.length, i, p = 0,
        encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === "=") {
          bufferLength--;
          if (base64[base64.length - 2] === "=") {
            bufferLength--;
          }
        }

        var arraybuffer = new ArrayBuffer(bufferLength),
        bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i+=4) {
          encoded1 = lookup[base64.charCodeAt(i)];
          encoded2 = lookup[base64.charCodeAt(i+1)];
          encoded3 = lookup[base64.charCodeAt(i+2)];
          encoded4 = lookup[base64.charCodeAt(i+3)];

          bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
          bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
          bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return arraybuffer;
      };
    })();
    });
    var base64Arraybuffer_1 = base64Arraybuffer.encode;
    var base64Arraybuffer_2 = base64Arraybuffer.decode;

    /**
     * Create a blob builder even when vendor prefixes exist
     */

    var BlobBuilder = typeof BlobBuilder !== 'undefined' ? BlobBuilder :
      typeof WebKitBlobBuilder !== 'undefined' ? WebKitBlobBuilder :
      typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder :
      typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : 
      false;

    /**
     * Check if Blob constructor is supported
     */

    var blobSupported = (function() {
      try {
        var a = new Blob(['hi']);
        return a.size === 2;
      } catch(e) {
        return false;
      }
    })();

    /**
     * Check if Blob constructor supports ArrayBufferViews
     * Fails in Safari 6, so we need to map to ArrayBuffers there.
     */

    var blobSupportsArrayBufferView = blobSupported && (function() {
      try {
        var b = new Blob([new Uint8Array([1,2])]);
        return b.size === 2;
      } catch(e) {
        return false;
      }
    })();

    /**
     * Check if BlobBuilder is supported
     */

    var blobBuilderSupported = BlobBuilder
      && BlobBuilder.prototype.append
      && BlobBuilder.prototype.getBlob;

    /**
     * Helper function that maps ArrayBufferViews to ArrayBuffers
     * Used by BlobBuilder constructor and old browsers that didn't
     * support it in the Blob constructor.
     */

    function mapArrayBufferViews(ary) {
      return ary.map(function(chunk) {
        if (chunk.buffer instanceof ArrayBuffer) {
          var buf = chunk.buffer;

          // if this is a subarray, make a copy so we only
          // include the subarray region from the underlying buffer
          if (chunk.byteLength !== buf.byteLength) {
            var copy = new Uint8Array(chunk.byteLength);
            copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
            buf = copy.buffer;
          }

          return buf;
        }

        return chunk;
      });
    }

    function BlobBuilderConstructor(ary, options) {
      options = options || {};

      var bb = new BlobBuilder();
      mapArrayBufferViews(ary).forEach(function(part) {
        bb.append(part);
      });

      return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
    }
    function BlobConstructor(ary, options) {
      return new Blob(mapArrayBufferViews(ary), options || {});
    }
    if (typeof Blob !== 'undefined') {
      BlobBuilderConstructor.prototype = Blob.prototype;
      BlobConstructor.prototype = Blob.prototype;
    }

    var blob = (function() {
      if (blobSupported) {
        return blobSupportsArrayBufferView ? Blob : BlobConstructor;
      } else if (blobBuilderSupported) {
        return BlobBuilderConstructor;
      } else {
        return undefined;
      }
    })();

    var browser$2 = createCommonjsModule(function (module, exports) {
    /**
     * Module dependencies.
     */







    var base64encoder;
    if (typeof ArrayBuffer !== 'undefined') {
      base64encoder = base64Arraybuffer;
    }

    /**
     * Check if we are running an android browser. That requires us to use
     * ArrayBuffer with polling transports...
     *
     * http://ghinda.net/jpeg-blob-ajax-android/
     */

    var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

    /**
     * Check if we are running in PhantomJS.
     * Uploading a Blob with PhantomJS does not work correctly, as reported here:
     * https://github.com/ariya/phantomjs/issues/11395
     * @type boolean
     */
    var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

    /**
     * When true, avoids using Blobs to encode payloads.
     * @type boolean
     */
    var dontSendBlobs = isAndroid || isPhantomJS;

    /**
     * Current protocol version.
     */

    exports.protocol = 3;

    /**
     * Packet types.
     */

    var packets = exports.packets = {
        open:     0    // non-ws
      , close:    1    // non-ws
      , ping:     2
      , pong:     3
      , message:  4
      , upgrade:  5
      , noop:     6
    };

    var packetslist = keys(packets);

    /**
     * Premade error packet.
     */

    var err = { type: 'error', data: 'parser error' };

    /**
     * Create a blob api even for blob builder when vendor prefixes exist
     */



    /**
     * Encodes a packet.
     *
     *     <packet type id> [ <data> ]
     *
     * Example:
     *
     *     5hello world
     *     3
     *     4
     *
     * Binary is encoded in an identical principle
     *
     * @api private
     */

    exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
      if (typeof supportsBinary === 'function') {
        callback = supportsBinary;
        supportsBinary = false;
      }

      if (typeof utf8encode === 'function') {
        callback = utf8encode;
        utf8encode = null;
      }

      var data = (packet.data === undefined)
        ? undefined
        : packet.data.buffer || packet.data;

      if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
        return encodeArrayBuffer(packet, supportsBinary, callback);
      } else if (typeof blob !== 'undefined' && data instanceof blob) {
        return encodeBlob(packet, supportsBinary, callback);
      }

      // might be an object with { base64: true, data: dataAsBase64String }
      if (data && data.base64) {
        return encodeBase64Object(packet, callback);
      }

      // Sending data as a utf-8 string
      var encoded = packets[packet.type];

      // data fragment is optional
      if (undefined !== packet.data) {
        encoded += utf8encode ? utf8.encode(String(packet.data), { strict: false }) : String(packet.data);
      }

      return callback('' + encoded);

    };

    function encodeBase64Object(packet, callback) {
      // packet data is an object { base64: true, data: dataAsBase64String }
      var message = 'b' + exports.packets[packet.type] + packet.data.data;
      return callback(message);
    }

    /**
     * Encode packet helpers for binary types
     */

    function encodeArrayBuffer(packet, supportsBinary, callback) {
      if (!supportsBinary) {
        return exports.encodeBase64Packet(packet, callback);
      }

      var data = packet.data;
      var contentArray = new Uint8Array(data);
      var resultBuffer = new Uint8Array(1 + data.byteLength);

      resultBuffer[0] = packets[packet.type];
      for (var i = 0; i < contentArray.length; i++) {
        resultBuffer[i+1] = contentArray[i];
      }

      return callback(resultBuffer.buffer);
    }

    function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
      if (!supportsBinary) {
        return exports.encodeBase64Packet(packet, callback);
      }

      var fr = new FileReader();
      fr.onload = function() {
        exports.encodePacket({ type: packet.type, data: fr.result }, supportsBinary, true, callback);
      };
      return fr.readAsArrayBuffer(packet.data);
    }

    function encodeBlob(packet, supportsBinary, callback) {
      if (!supportsBinary) {
        return exports.encodeBase64Packet(packet, callback);
      }

      if (dontSendBlobs) {
        return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
      }

      var length = new Uint8Array(1);
      length[0] = packets[packet.type];
      var blob$1 = new blob([length.buffer, packet.data]);

      return callback(blob$1);
    }

    /**
     * Encodes a packet with binary data in a base64 string
     *
     * @param {Object} packet, has `type` and `data`
     * @return {String} base64 encoded message
     */

    exports.encodeBase64Packet = function(packet, callback) {
      var message = 'b' + exports.packets[packet.type];
      if (typeof blob !== 'undefined' && packet.data instanceof blob) {
        var fr = new FileReader();
        fr.onload = function() {
          var b64 = fr.result.split(',')[1];
          callback(message + b64);
        };
        return fr.readAsDataURL(packet.data);
      }

      var b64data;
      try {
        b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
      } catch (e) {
        // iPhone Safari doesn't let you apply with typed arrays
        var typed = new Uint8Array(packet.data);
        var basic = new Array(typed.length);
        for (var i = 0; i < typed.length; i++) {
          basic[i] = typed[i];
        }
        b64data = String.fromCharCode.apply(null, basic);
      }
      message += btoa(b64data);
      return callback(message);
    };

    /**
     * Decodes a packet. Changes format to Blob if requested.
     *
     * @return {Object} with `type` and `data` (if any)
     * @api private
     */

    exports.decodePacket = function (data, binaryType, utf8decode) {
      if (data === undefined) {
        return err;
      }
      // String data
      if (typeof data === 'string') {
        if (data.charAt(0) === 'b') {
          return exports.decodeBase64Packet(data.substr(1), binaryType);
        }

        if (utf8decode) {
          data = tryDecode(data);
          if (data === false) {
            return err;
          }
        }
        var type = data.charAt(0);

        if (Number(type) != type || !packetslist[type]) {
          return err;
        }

        if (data.length > 1) {
          return { type: packetslist[type], data: data.substring(1) };
        } else {
          return { type: packetslist[type] };
        }
      }

      var asArray = new Uint8Array(data);
      var type = asArray[0];
      var rest = arraybuffer_slice(data, 1);
      if (blob && binaryType === 'blob') {
        rest = new blob([rest]);
      }
      return { type: packetslist[type], data: rest };
    };

    function tryDecode(data) {
      try {
        data = utf8.decode(data, { strict: false });
      } catch (e) {
        return false;
      }
      return data;
    }

    /**
     * Decodes a packet encoded in a base64 string
     *
     * @param {String} base64 encoded message
     * @return {Object} with `type` and `data` (if any)
     */

    exports.decodeBase64Packet = function(msg, binaryType) {
      var type = packetslist[msg.charAt(0)];
      if (!base64encoder) {
        return { type: type, data: { base64: true, data: msg.substr(1) } };
      }

      var data = base64encoder.decode(msg.substr(1));

      if (binaryType === 'blob' && blob) {
        data = new blob([data]);
      }

      return { type: type, data: data };
    };

    /**
     * Encodes multiple messages (payload).
     *
     *     <length>:data
     *
     * Example:
     *
     *     11:hello world2:hi
     *
     * If any contents are binary, they will be encoded as base64 strings. Base64
     * encoded strings are marked with a b before the length specifier
     *
     * @param {Array} packets
     * @api private
     */

    exports.encodePayload = function (packets, supportsBinary, callback) {
      if (typeof supportsBinary === 'function') {
        callback = supportsBinary;
        supportsBinary = null;
      }

      var isBinary = hasBinary2(packets);

      if (supportsBinary && isBinary) {
        if (blob && !dontSendBlobs) {
          return exports.encodePayloadAsBlob(packets, callback);
        }

        return exports.encodePayloadAsArrayBuffer(packets, callback);
      }

      if (!packets.length) {
        return callback('0:');
      }

      function setLengthHeader(message) {
        return message.length + ':' + message;
      }

      function encodeOne(packet, doneCallback) {
        exports.encodePacket(packet, !isBinary ? false : supportsBinary, false, function(message) {
          doneCallback(null, setLengthHeader(message));
        });
      }

      map(packets, encodeOne, function(err, results) {
        return callback(results.join(''));
      });
    };

    /**
     * Async array map using after
     */

    function map(ary, each, done) {
      var result = new Array(ary.length);
      var next = after_1(ary.length, done);

      var eachWithIndex = function(i, el, cb) {
        each(el, function(error, msg) {
          result[i] = msg;
          cb(error, result);
        });
      };

      for (var i = 0; i < ary.length; i++) {
        eachWithIndex(i, ary[i], next);
      }
    }

    /*
     * Decodes data when a payload is maybe expected. Possible binary contents are
     * decoded from their base64 representation
     *
     * @param {String} data, callback method
     * @api public
     */

    exports.decodePayload = function (data, binaryType, callback) {
      if (typeof data !== 'string') {
        return exports.decodePayloadAsBinary(data, binaryType, callback);
      }

      if (typeof binaryType === 'function') {
        callback = binaryType;
        binaryType = null;
      }

      var packet;
      if (data === '') {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      var length = '', n, msg;

      for (var i = 0, l = data.length; i < l; i++) {
        var chr = data.charAt(i);

        if (chr !== ':') {
          length += chr;
          continue;
        }

        if (length === '' || (length != (n = Number(length)))) {
          // parser error - ignoring payload
          return callback(err, 0, 1);
        }

        msg = data.substr(i + 1, n);

        if (length != msg.length) {
          // parser error - ignoring payload
          return callback(err, 0, 1);
        }

        if (msg.length) {
          packet = exports.decodePacket(msg, binaryType, false);

          if (err.type === packet.type && err.data === packet.data) {
            // parser error in individual packet - ignoring payload
            return callback(err, 0, 1);
          }

          var ret = callback(packet, i + n, l);
          if (false === ret) return;
        }

        // advance cursor
        i += n;
        length = '';
      }

      if (length !== '') {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

    };

    /**
     * Encodes multiple messages (payload) as binary.
     *
     * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
     * 255><data>
     *
     * Example:
     * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
     *
     * @param {Array} packets
     * @return {ArrayBuffer} encoded payload
     * @api private
     */

    exports.encodePayloadAsArrayBuffer = function(packets, callback) {
      if (!packets.length) {
        return callback(new ArrayBuffer(0));
      }

      function encodeOne(packet, doneCallback) {
        exports.encodePacket(packet, true, true, function(data) {
          return doneCallback(null, data);
        });
      }

      map(packets, encodeOne, function(err, encodedPackets) {
        var totalLength = encodedPackets.reduce(function(acc, p) {
          var len;
          if (typeof p === 'string'){
            len = p.length;
          } else {
            len = p.byteLength;
          }
          return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
        }, 0);

        var resultArray = new Uint8Array(totalLength);

        var bufferIndex = 0;
        encodedPackets.forEach(function(p) {
          var isString = typeof p === 'string';
          var ab = p;
          if (isString) {
            var view = new Uint8Array(p.length);
            for (var i = 0; i < p.length; i++) {
              view[i] = p.charCodeAt(i);
            }
            ab = view.buffer;
          }

          if (isString) { // not true binary
            resultArray[bufferIndex++] = 0;
          } else { // true binary
            resultArray[bufferIndex++] = 1;
          }

          var lenStr = ab.byteLength.toString();
          for (var i = 0; i < lenStr.length; i++) {
            resultArray[bufferIndex++] = parseInt(lenStr[i]);
          }
          resultArray[bufferIndex++] = 255;

          var view = new Uint8Array(ab);
          for (var i = 0; i < view.length; i++) {
            resultArray[bufferIndex++] = view[i];
          }
        });

        return callback(resultArray.buffer);
      });
    };

    /**
     * Encode as Blob
     */

    exports.encodePayloadAsBlob = function(packets, callback) {
      function encodeOne(packet, doneCallback) {
        exports.encodePacket(packet, true, true, function(encoded) {
          var binaryIdentifier = new Uint8Array(1);
          binaryIdentifier[0] = 1;
          if (typeof encoded === 'string') {
            var view = new Uint8Array(encoded.length);
            for (var i = 0; i < encoded.length; i++) {
              view[i] = encoded.charCodeAt(i);
            }
            encoded = view.buffer;
            binaryIdentifier[0] = 0;
          }

          var len = (encoded instanceof ArrayBuffer)
            ? encoded.byteLength
            : encoded.size;

          var lenStr = len.toString();
          var lengthAry = new Uint8Array(lenStr.length + 1);
          for (var i = 0; i < lenStr.length; i++) {
            lengthAry[i] = parseInt(lenStr[i]);
          }
          lengthAry[lenStr.length] = 255;

          if (blob) {
            var blob$1 = new blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
            doneCallback(null, blob$1);
          }
        });
      }

      map(packets, encodeOne, function(err, results) {
        return callback(new blob(results));
      });
    };

    /*
     * Decodes data when a payload is maybe expected. Strings are decoded by
     * interpreting each byte as a key code for entries marked to start with 0. See
     * description of encodePayloadAsBinary
     *
     * @param {ArrayBuffer} data, callback method
     * @api public
     */

    exports.decodePayloadAsBinary = function (data, binaryType, callback) {
      if (typeof binaryType === 'function') {
        callback = binaryType;
        binaryType = null;
      }

      var bufferTail = data;
      var buffers = [];

      while (bufferTail.byteLength > 0) {
        var tailArray = new Uint8Array(bufferTail);
        var isString = tailArray[0] === 0;
        var msgLength = '';

        for (var i = 1; ; i++) {
          if (tailArray[i] === 255) break;

          // 310 = char length of Number.MAX_VALUE
          if (msgLength.length > 310) {
            return callback(err, 0, 1);
          }

          msgLength += tailArray[i];
        }

        bufferTail = arraybuffer_slice(bufferTail, 2 + msgLength.length);
        msgLength = parseInt(msgLength);

        var msg = arraybuffer_slice(bufferTail, 0, msgLength);
        if (isString) {
          try {
            msg = String.fromCharCode.apply(null, new Uint8Array(msg));
          } catch (e) {
            // iPhone Safari doesn't let you apply to typed arrays
            var typed = new Uint8Array(msg);
            msg = '';
            for (var i = 0; i < typed.length; i++) {
              msg += String.fromCharCode(typed[i]);
            }
          }
        }

        buffers.push(msg);
        bufferTail = arraybuffer_slice(bufferTail, msgLength);
      }

      var total = buffers.length;
      buffers.forEach(function(buffer, i) {
        callback(exports.decodePacket(buffer, binaryType, true), i, total);
      });
    };
    });
    var browser_1$2 = browser$2.protocol;
    var browser_2$2 = browser$2.packets;
    var browser_3$2 = browser$2.encodePacket;
    var browser_4$2 = browser$2.encodeBase64Packet;
    var browser_5$2 = browser$2.decodePacket;
    var browser_6$2 = browser$2.decodeBase64Packet;
    var browser_7$2 = browser$2.encodePayload;
    var browser_8 = browser$2.decodePayload;
    var browser_9 = browser$2.encodePayloadAsArrayBuffer;
    var browser_10 = browser$2.encodePayloadAsBlob;
    var browser_11 = browser$2.decodePayloadAsBinary;

    var componentEmitter$1 = createCommonjsModule(function (module) {
    /**
     * Expose `Emitter`.
     */

    {
      module.exports = Emitter;
    }

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    }
    /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }

    /**
     * Listen on the given `event` with `fn`.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};
      (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
        .push(fn);
      return this;
    };

    /**
     * Adds an `event` listener that will be invoked a single
     * time then automatically removed.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.once = function(event, fn){
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }

      on.fn = fn;
      this.on(event, on);
      return this;
    };

    /**
     * Remove the given callback for `event` or all
     * registered callbacks.
     *
     * @param {String} event
     * @param {Function} fn
     * @return {Emitter}
     * @api public
     */

    Emitter.prototype.off =
    Emitter.prototype.removeListener =
    Emitter.prototype.removeAllListeners =
    Emitter.prototype.removeEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};

      // all
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }

      // specific event
      var callbacks = this._callbacks['$' + event];
      if (!callbacks) return this;

      // remove all handlers
      if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
      }

      // remove specific handler
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };

    /**
     * Emit `event` with the given args.
     *
     * @param {String} event
     * @param {Mixed} ...
     * @return {Emitter}
     */

    Emitter.prototype.emit = function(event){
      this._callbacks = this._callbacks || {};
      var args = [].slice.call(arguments, 1)
        , callbacks = this._callbacks['$' + event];

      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }

      return this;
    };

    /**
     * Return array of callbacks for `event`.
     *
     * @param {String} event
     * @return {Array}
     * @api public
     */

    Emitter.prototype.listeners = function(event){
      this._callbacks = this._callbacks || {};
      return this._callbacks['$' + event] || [];
    };

    /**
     * Check if this emitter has `event` handlers.
     *
     * @param {String} event
     * @return {Boolean}
     * @api public
     */

    Emitter.prototype.hasListeners = function(event){
      return !! this.listeners(event).length;
    };
    });

    /**
     * Module dependencies.
     */




    /**
     * Module exports.
     */

    var transport = Transport;

    /**
     * Transport abstract constructor.
     *
     * @param {Object} options.
     * @api private
     */

    function Transport (opts) {
      this.path = opts.path;
      this.hostname = opts.hostname;
      this.port = opts.port;
      this.secure = opts.secure;
      this.query = opts.query;
      this.timestampParam = opts.timestampParam;
      this.timestampRequests = opts.timestampRequests;
      this.readyState = '';
      this.agent = opts.agent || false;
      this.socket = opts.socket;
      this.enablesXDR = opts.enablesXDR;
      this.withCredentials = opts.withCredentials;

      // SSL options for Node.js client
      this.pfx = opts.pfx;
      this.key = opts.key;
      this.passphrase = opts.passphrase;
      this.cert = opts.cert;
      this.ca = opts.ca;
      this.ciphers = opts.ciphers;
      this.rejectUnauthorized = opts.rejectUnauthorized;
      this.forceNode = opts.forceNode;

      // results of ReactNative environment detection
      this.isReactNative = opts.isReactNative;

      // other options for Node.js client
      this.extraHeaders = opts.extraHeaders;
      this.localAddress = opts.localAddress;
    }

    /**
     * Mix in `Emitter`.
     */

    componentEmitter$1(Transport.prototype);

    /**
     * Emits an error.
     *
     * @param {String} str
     * @return {Transport} for chaining
     * @api public
     */

    Transport.prototype.onError = function (msg, desc) {
      var err = new Error(msg);
      err.type = 'TransportError';
      err.description = desc;
      this.emit('error', err);
      return this;
    };

    /**
     * Opens the transport.
     *
     * @api public
     */

    Transport.prototype.open = function () {
      if ('closed' === this.readyState || '' === this.readyState) {
        this.readyState = 'opening';
        this.doOpen();
      }

      return this;
    };

    /**
     * Closes the transport.
     *
     * @api private
     */

    Transport.prototype.close = function () {
      if ('opening' === this.readyState || 'open' === this.readyState) {
        this.doClose();
        this.onClose();
      }

      return this;
    };

    /**
     * Sends multiple packets.
     *
     * @param {Array} packets
     * @api private
     */

    Transport.prototype.send = function (packets) {
      if ('open' === this.readyState) {
        this.write(packets);
      } else {
        throw new Error('Transport not open');
      }
    };

    /**
     * Called upon open
     *
     * @api private
     */

    Transport.prototype.onOpen = function () {
      this.readyState = 'open';
      this.writable = true;
      this.emit('open');
    };

    /**
     * Called with data.
     *
     * @param {String} data
     * @api private
     */

    Transport.prototype.onData = function (data) {
      var packet = browser$2.decodePacket(data, this.socket.binaryType);
      this.onPacket(packet);
    };

    /**
     * Called with a decoded packet.
     */

    Transport.prototype.onPacket = function (packet) {
      this.emit('packet', packet);
    };

    /**
     * Called upon close.
     *
     * @api private
     */

    Transport.prototype.onClose = function () {
      this.readyState = 'closed';
      this.emit('close');
    };

    /**
     * Compiles a querystring
     * Returns string representation of the object
     *
     * @param {Object}
     * @api private
     */

    var encode = function (obj) {
      var str = '';

      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (str.length) str += '&';
          str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
        }
      }

      return str;
    };

    /**
     * Parses a simple querystring into an object
     *
     * @param {String} qs
     * @api private
     */

    var decode = function(qs){
      var qry = {};
      var pairs = qs.split('&');
      for (var i = 0, l = pairs.length; i < l; i++) {
        var pair = pairs[i].split('=');
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
      return qry;
    };

    var parseqs = {
    	encode: encode,
    	decode: decode
    };

    var componentInherit = function(a, b){
      var fn = function(){};
      fn.prototype = b.prototype;
      a.prototype = new fn;
      a.prototype.constructor = a;
    };

    var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
      , length = 64
      , map = {}
      , seed = 0
      , i = 0
      , prev;

    /**
     * Return a string representing the specified number.
     *
     * @param {Number} num The number to convert.
     * @returns {String} The string representation of the number.
     * @api public
     */
    function encode$1(num) {
      var encoded = '';

      do {
        encoded = alphabet[num % length] + encoded;
        num = Math.floor(num / length);
      } while (num > 0);

      return encoded;
    }

    /**
     * Return the integer value specified by the given string.
     *
     * @param {String} str The string to convert.
     * @returns {Number} The integer value represented by the string.
     * @api public
     */
    function decode$1(str) {
      var decoded = 0;

      for (i = 0; i < str.length; i++) {
        decoded = decoded * length + map[str.charAt(i)];
      }

      return decoded;
    }

    /**
     * Yeast: A tiny growing id generator.
     *
     * @returns {String} A unique id.
     * @api public
     */
    function yeast() {
      var now = encode$1(+new Date());

      if (now !== prev) return seed = 0, prev = now;
      return now +'.'+ encode$1(seed++);
    }

    //
    // Map each character to its index.
    //
    for (; i < length; i++) map[alphabet[i]] = i;

    //
    // Expose the `yeast`, `encode` and `decode` functions.
    //
    yeast.encode = encode$1;
    yeast.decode = decode$1;
    var yeast_1 = yeast;

    /**
     * Module dependencies.
     */






    var debug$2 = browser('engine.io-client:polling');

    /**
     * Module exports.
     */

    var polling = Polling;

    /**
     * Is XHR2 supported?
     */

    var hasXHR2 = (function () {
      var XMLHttpRequest = xmlhttprequest;
      var xhr = new XMLHttpRequest({ xdomain: false });
      return null != xhr.responseType;
    })();

    /**
     * Polling interface.
     *
     * @param {Object} opts
     * @api private
     */

    function Polling (opts) {
      var forceBase64 = (opts && opts.forceBase64);
      if (!hasXHR2 || forceBase64) {
        this.supportsBinary = false;
      }
      transport.call(this, opts);
    }

    /**
     * Inherits from Transport.
     */

    componentInherit(Polling, transport);

    /**
     * Transport name.
     */

    Polling.prototype.name = 'polling';

    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @api private
     */

    Polling.prototype.doOpen = function () {
      this.poll();
    };

    /**
     * Pauses polling.
     *
     * @param {Function} callback upon buffers are flushed and transport is paused
     * @api private
     */

    Polling.prototype.pause = function (onPause) {
      var self = this;

      this.readyState = 'pausing';

      function pause () {
        debug$2('paused');
        self.readyState = 'paused';
        onPause();
      }

      if (this.polling || !this.writable) {
        var total = 0;

        if (this.polling) {
          debug$2('we are currently polling - waiting to pause');
          total++;
          this.once('pollComplete', function () {
            debug$2('pre-pause polling complete');
            --total || pause();
          });
        }

        if (!this.writable) {
          debug$2('we are currently writing - waiting to pause');
          total++;
          this.once('drain', function () {
            debug$2('pre-pause writing complete');
            --total || pause();
          });
        }
      } else {
        pause();
      }
    };

    /**
     * Starts polling cycle.
     *
     * @api public
     */

    Polling.prototype.poll = function () {
      debug$2('polling');
      this.polling = true;
      this.doPoll();
      this.emit('poll');
    };

    /**
     * Overloads onData to detect payloads.
     *
     * @api private
     */

    Polling.prototype.onData = function (data) {
      var self = this;
      debug$2('polling got data %s', data);
      var callback = function (packet, index, total) {
        // if its the first message we consider the transport open
        if ('opening' === self.readyState) {
          self.onOpen();
        }

        // if its a close packet, we close the ongoing requests
        if ('close' === packet.type) {
          self.onClose();
          return false;
        }

        // otherwise bypass onData and handle the message
        self.onPacket(packet);
      };

      // decode payload
      browser$2.decodePayload(data, this.socket.binaryType, callback);

      // if an event did not trigger closing
      if ('closed' !== this.readyState) {
        // if we got data we're not polling
        this.polling = false;
        this.emit('pollComplete');

        if ('open' === this.readyState) {
          this.poll();
        } else {
          debug$2('ignoring poll - transport state "%s"', this.readyState);
        }
      }
    };

    /**
     * For polling, send a close packet.
     *
     * @api private
     */

    Polling.prototype.doClose = function () {
      var self = this;

      function close () {
        debug$2('writing close packet');
        self.write([{ type: 'close' }]);
      }

      if ('open' === this.readyState) {
        debug$2('transport open - closing');
        close();
      } else {
        // in case we're trying to close while
        // handshaking is in progress (GH-164)
        debug$2('transport not open - deferring close');
        this.once('open', close);
      }
    };

    /**
     * Writes a packets payload.
     *
     * @param {Array} data packets
     * @param {Function} drain callback
     * @api private
     */

    Polling.prototype.write = function (packets) {
      var self = this;
      this.writable = false;
      var callbackfn = function () {
        self.writable = true;
        self.emit('drain');
      };

      browser$2.encodePayload(packets, this.supportsBinary, function (data) {
        self.doWrite(data, callbackfn);
      });
    };

    /**
     * Generates uri for connection.
     *
     * @api private
     */

    Polling.prototype.uri = function () {
      var query = this.query || {};
      var schema = this.secure ? 'https' : 'http';
      var port = '';

      // cache busting is forced
      if (false !== this.timestampRequests) {
        query[this.timestampParam] = yeast_1();
      }

      if (!this.supportsBinary && !query.sid) {
        query.b64 = 1;
      }

      query = parseqs.encode(query);

      // avoid port if default for schema
      if (this.port && (('https' === schema && Number(this.port) !== 443) ||
         ('http' === schema && Number(this.port) !== 80))) {
        port = ':' + this.port;
      }

      // prepend ? to query
      if (query.length) {
        query = '?' + query;
      }

      var ipv6 = this.hostname.indexOf(':') !== -1;
      return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
    };

    /* global attachEvent */

    /**
     * Module requirements.
     */





    var debug$3 = browser('engine.io-client:polling-xhr');


    /**
     * Module exports.
     */

    var pollingXhr = XHR;
    var Request_1 = Request;

    /**
     * Empty function
     */

    function empty$1 () {}

    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @api public
     */

    function XHR (opts) {
      polling.call(this, opts);
      this.requestTimeout = opts.requestTimeout;
      this.extraHeaders = opts.extraHeaders;

      if (typeof location !== 'undefined') {
        var isSSL = 'https:' === location.protocol;
        var port = location.port;

        // some user agents have empty `location.port`
        if (!port) {
          port = isSSL ? 443 : 80;
        }

        this.xd = (typeof location !== 'undefined' && opts.hostname !== location.hostname) ||
          port !== opts.port;
        this.xs = opts.secure !== isSSL;
      }
    }

    /**
     * Inherits from Polling.
     */

    componentInherit(XHR, polling);

    /**
     * XHR supports binary
     */

    XHR.prototype.supportsBinary = true;

    /**
     * Creates a request.
     *
     * @param {String} method
     * @api private
     */

    XHR.prototype.request = function (opts) {
      opts = opts || {};
      opts.uri = this.uri();
      opts.xd = this.xd;
      opts.xs = this.xs;
      opts.agent = this.agent || false;
      opts.supportsBinary = this.supportsBinary;
      opts.enablesXDR = this.enablesXDR;
      opts.withCredentials = this.withCredentials;

      // SSL options for Node.js client
      opts.pfx = this.pfx;
      opts.key = this.key;
      opts.passphrase = this.passphrase;
      opts.cert = this.cert;
      opts.ca = this.ca;
      opts.ciphers = this.ciphers;
      opts.rejectUnauthorized = this.rejectUnauthorized;
      opts.requestTimeout = this.requestTimeout;

      // other options for Node.js client
      opts.extraHeaders = this.extraHeaders;

      return new Request(opts);
    };

    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @api private
     */

    XHR.prototype.doWrite = function (data, fn) {
      var isBinary = typeof data !== 'string' && data !== undefined;
      var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
      var self = this;
      req.on('success', fn);
      req.on('error', function (err) {
        self.onError('xhr post error', err);
      });
      this.sendXhr = req;
    };

    /**
     * Starts a poll cycle.
     *
     * @api private
     */

    XHR.prototype.doPoll = function () {
      debug$3('xhr poll');
      var req = this.request();
      var self = this;
      req.on('data', function (data) {
        self.onData(data);
      });
      req.on('error', function (err) {
        self.onError('xhr poll error', err);
      });
      this.pollXhr = req;
    };

    /**
     * Request constructor
     *
     * @param {Object} options
     * @api public
     */

    function Request (opts) {
      this.method = opts.method || 'GET';
      this.uri = opts.uri;
      this.xd = !!opts.xd;
      this.xs = !!opts.xs;
      this.async = false !== opts.async;
      this.data = undefined !== opts.data ? opts.data : null;
      this.agent = opts.agent;
      this.isBinary = opts.isBinary;
      this.supportsBinary = opts.supportsBinary;
      this.enablesXDR = opts.enablesXDR;
      this.withCredentials = opts.withCredentials;
      this.requestTimeout = opts.requestTimeout;

      // SSL options for Node.js client
      this.pfx = opts.pfx;
      this.key = opts.key;
      this.passphrase = opts.passphrase;
      this.cert = opts.cert;
      this.ca = opts.ca;
      this.ciphers = opts.ciphers;
      this.rejectUnauthorized = opts.rejectUnauthorized;

      // other options for Node.js client
      this.extraHeaders = opts.extraHeaders;

      this.create();
    }

    /**
     * Mix in `Emitter`.
     */

    componentEmitter$1(Request.prototype);

    /**
     * Creates the XHR object and sends the request.
     *
     * @api private
     */

    Request.prototype.create = function () {
      var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

      // SSL options for Node.js client
      opts.pfx = this.pfx;
      opts.key = this.key;
      opts.passphrase = this.passphrase;
      opts.cert = this.cert;
      opts.ca = this.ca;
      opts.ciphers = this.ciphers;
      opts.rejectUnauthorized = this.rejectUnauthorized;

      var xhr = this.xhr = new xmlhttprequest(opts);
      var self = this;

      try {
        debug$3('xhr open %s: %s', this.method, this.uri);
        xhr.open(this.method, this.uri, this.async);
        try {
          if (this.extraHeaders) {
            xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
            for (var i in this.extraHeaders) {
              if (this.extraHeaders.hasOwnProperty(i)) {
                xhr.setRequestHeader(i, this.extraHeaders[i]);
              }
            }
          }
        } catch (e) {}

        if ('POST' === this.method) {
          try {
            if (this.isBinary) {
              xhr.setRequestHeader('Content-type', 'application/octet-stream');
            } else {
              xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
            }
          } catch (e) {}
        }

        try {
          xhr.setRequestHeader('Accept', '*/*');
        } catch (e) {}

        // ie6 check
        if ('withCredentials' in xhr) {
          xhr.withCredentials = this.withCredentials;
        }

        if (this.requestTimeout) {
          xhr.timeout = this.requestTimeout;
        }

        if (this.hasXDR()) {
          xhr.onload = function () {
            self.onLoad();
          };
          xhr.onerror = function () {
            self.onError(xhr.responseText);
          };
        } else {
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 2) {
              try {
                var contentType = xhr.getResponseHeader('Content-Type');
                if (self.supportsBinary && contentType === 'application/octet-stream' || contentType === 'application/octet-stream; charset=UTF-8') {
                  xhr.responseType = 'arraybuffer';
                }
              } catch (e) {}
            }
            if (4 !== xhr.readyState) return;
            if (200 === xhr.status || 1223 === xhr.status) {
              self.onLoad();
            } else {
              // make sure the `error` event handler that's user-set
              // does not throw in the same tick and gets caught here
              setTimeout(function () {
                self.onError(typeof xhr.status === 'number' ? xhr.status : 0);
              }, 0);
            }
          };
        }

        debug$3('xhr data %s', this.data);
        xhr.send(this.data);
      } catch (e) {
        // Need to defer since .create() is called directly fhrom the constructor
        // and thus the 'error' event can only be only bound *after* this exception
        // occurs.  Therefore, also, we cannot throw here at all.
        setTimeout(function () {
          self.onError(e);
        }, 0);
        return;
      }

      if (typeof document !== 'undefined') {
        this.index = Request.requestsCount++;
        Request.requests[this.index] = this;
      }
    };

    /**
     * Called upon successful response.
     *
     * @api private
     */

    Request.prototype.onSuccess = function () {
      this.emit('success');
      this.cleanup();
    };

    /**
     * Called if we have data.
     *
     * @api private
     */

    Request.prototype.onData = function (data) {
      this.emit('data', data);
      this.onSuccess();
    };

    /**
     * Called upon error.
     *
     * @api private
     */

    Request.prototype.onError = function (err) {
      this.emit('error', err);
      this.cleanup(true);
    };

    /**
     * Cleans up house.
     *
     * @api private
     */

    Request.prototype.cleanup = function (fromError) {
      if ('undefined' === typeof this.xhr || null === this.xhr) {
        return;
      }
      // xmlhttprequest
      if (this.hasXDR()) {
        this.xhr.onload = this.xhr.onerror = empty$1;
      } else {
        this.xhr.onreadystatechange = empty$1;
      }

      if (fromError) {
        try {
          this.xhr.abort();
        } catch (e) {}
      }

      if (typeof document !== 'undefined') {
        delete Request.requests[this.index];
      }

      this.xhr = null;
    };

    /**
     * Called upon load.
     *
     * @api private
     */

    Request.prototype.onLoad = function () {
      var data;
      try {
        var contentType;
        try {
          contentType = this.xhr.getResponseHeader('Content-Type');
        } catch (e) {}
        if (contentType === 'application/octet-stream' || contentType === 'application/octet-stream; charset=UTF-8') {
          data = this.xhr.response || this.xhr.responseText;
        } else {
          data = this.xhr.responseText;
        }
      } catch (e) {
        this.onError(e);
      }
      if (null != data) {
        this.onData(data);
      }
    };

    /**
     * Check if it has XDomainRequest.
     *
     * @api private
     */

    Request.prototype.hasXDR = function () {
      return typeof XDomainRequest !== 'undefined' && !this.xs && this.enablesXDR;
    };

    /**
     * Aborts the request.
     *
     * @api public
     */

    Request.prototype.abort = function () {
      this.cleanup();
    };

    /**
     * Aborts pending requests when unloading the window. This is needed to prevent
     * memory leaks (e.g. when using IE) and to ensure that no spurious error is
     * emitted.
     */

    Request.requestsCount = 0;
    Request.requests = {};

    if (typeof document !== 'undefined') {
      if (typeof attachEvent === 'function') {
        attachEvent('onunload', unloadHandler);
      } else if (typeof addEventListener === 'function') {
        var terminationEvent = 'onpagehide' in globalThis_browser ? 'pagehide' : 'unload';
        addEventListener(terminationEvent, unloadHandler, false);
      }
    }

    function unloadHandler () {
      for (var i in Request.requests) {
        if (Request.requests.hasOwnProperty(i)) {
          Request.requests[i].abort();
        }
      }
    }
    pollingXhr.Request = Request_1;

    /**
     * Module requirements.
     */





    /**
     * Module exports.
     */

    var pollingJsonp = JSONPPolling;

    /**
     * Cached regular expressions.
     */

    var rNewline = /\n/g;
    var rEscapedNewline = /\\n/g;

    /**
     * Global JSONP callbacks.
     */

    var callbacks;

    /**
     * Noop.
     */

    function empty$2 () { }

    /**
     * JSONP Polling constructor.
     *
     * @param {Object} opts.
     * @api public
     */

    function JSONPPolling (opts) {
      polling.call(this, opts);

      this.query = this.query || {};

      // define global callbacks array if not present
      // we do this here (lazily) to avoid unneeded global pollution
      if (!callbacks) {
        // we need to consider multiple engines in the same page
        callbacks = globalThis_browser.___eio = (globalThis_browser.___eio || []);
      }

      // callback identifier
      this.index = callbacks.length;

      // add callback to jsonp global
      var self = this;
      callbacks.push(function (msg) {
        self.onData(msg);
      });

      // append to query string
      this.query.j = this.index;

      // prevent spurious errors from being emitted when the window is unloaded
      if (typeof addEventListener === 'function') {
        addEventListener('beforeunload', function () {
          if (self.script) self.script.onerror = empty$2;
        }, false);
      }
    }

    /**
     * Inherits from Polling.
     */

    componentInherit(JSONPPolling, polling);

    /*
     * JSONP only supports binary as base64 encoded strings
     */

    JSONPPolling.prototype.supportsBinary = false;

    /**
     * Closes the socket.
     *
     * @api private
     */

    JSONPPolling.prototype.doClose = function () {
      if (this.script) {
        this.script.parentNode.removeChild(this.script);
        this.script = null;
      }

      if (this.form) {
        this.form.parentNode.removeChild(this.form);
        this.form = null;
        this.iframe = null;
      }

      polling.prototype.doClose.call(this);
    };

    /**
     * Starts a poll cycle.
     *
     * @api private
     */

    JSONPPolling.prototype.doPoll = function () {
      var self = this;
      var script = document.createElement('script');

      if (this.script) {
        this.script.parentNode.removeChild(this.script);
        this.script = null;
      }

      script.async = true;
      script.src = this.uri();
      script.onerror = function (e) {
        self.onError('jsonp poll error', e);
      };

      var insertAt = document.getElementsByTagName('script')[0];
      if (insertAt) {
        insertAt.parentNode.insertBefore(script, insertAt);
      } else {
        (document.head || document.body).appendChild(script);
      }
      this.script = script;

      var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

      if (isUAgecko) {
        setTimeout(function () {
          var iframe = document.createElement('iframe');
          document.body.appendChild(iframe);
          document.body.removeChild(iframe);
        }, 100);
      }
    };

    /**
     * Writes with a hidden iframe.
     *
     * @param {String} data to send
     * @param {Function} called upon flush.
     * @api private
     */

    JSONPPolling.prototype.doWrite = function (data, fn) {
      var self = this;

      if (!this.form) {
        var form = document.createElement('form');
        var area = document.createElement('textarea');
        var id = this.iframeId = 'eio_iframe_' + this.index;
        var iframe;

        form.className = 'socketio';
        form.style.position = 'absolute';
        form.style.top = '-1000px';
        form.style.left = '-1000px';
        form.target = id;
        form.method = 'POST';
        form.setAttribute('accept-charset', 'utf-8');
        area.name = 'd';
        form.appendChild(area);
        document.body.appendChild(form);

        this.form = form;
        this.area = area;
      }

      this.form.action = this.uri();

      function complete () {
        initIframe();
        fn();
      }

      function initIframe () {
        if (self.iframe) {
          try {
            self.form.removeChild(self.iframe);
          } catch (e) {
            self.onError('jsonp polling iframe removal error', e);
          }
        }

        try {
          // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
          var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
          iframe = document.createElement(html);
        } catch (e) {
          iframe = document.createElement('iframe');
          iframe.name = self.iframeId;
          iframe.src = 'javascript:0';
        }

        iframe.id = self.iframeId;

        self.form.appendChild(iframe);
        self.iframe = iframe;
      }

      initIframe();

      // escape \n to prevent it from being converted into \r\n by some UAs
      // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
      data = data.replace(rEscapedNewline, '\\\n');
      this.area.value = data.replace(rNewline, '\\n');

      try {
        this.form.submit();
      } catch (e) {}

      if (this.iframe.attachEvent) {
        this.iframe.onreadystatechange = function () {
          if (self.iframe.readyState === 'complete') {
            complete();
          }
        };
      } else {
        this.iframe.onload = complete;
      }
    };

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$1 = getCjsExportFromNamespace(_nodeResolve_empty$1);

    /**
     * Module dependencies.
     */






    var debug$4 = browser('engine.io-client:websocket');

    var BrowserWebSocket, NodeWebSocket;

    if (typeof WebSocket !== 'undefined') {
      BrowserWebSocket = WebSocket;
    } else if (typeof self !== 'undefined') {
      BrowserWebSocket = self.WebSocket || self.MozWebSocket;
    }

    if (typeof window === 'undefined') {
      try {
        NodeWebSocket = require$$1;
      } catch (e) { }
    }

    /**
     * Get either the `WebSocket` or `MozWebSocket` globals
     * in the browser or try to resolve WebSocket-compatible
     * interface exposed by `ws` for Node-like environment.
     */

    var WebSocketImpl = BrowserWebSocket || NodeWebSocket;

    /**
     * Module exports.
     */

    var websocket = WS;

    /**
     * WebSocket transport constructor.
     *
     * @api {Object} connection options
     * @api public
     */

    function WS (opts) {
      var forceBase64 = (opts && opts.forceBase64);
      if (forceBase64) {
        this.supportsBinary = false;
      }
      this.perMessageDeflate = opts.perMessageDeflate;
      this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
      this.protocols = opts.protocols;
      if (!this.usingBrowserWebSocket) {
        WebSocketImpl = NodeWebSocket;
      }
      transport.call(this, opts);
    }

    /**
     * Inherits from Transport.
     */

    componentInherit(WS, transport);

    /**
     * Transport name.
     *
     * @api public
     */

    WS.prototype.name = 'websocket';

    /*
     * WebSockets support binary
     */

    WS.prototype.supportsBinary = true;

    /**
     * Opens socket.
     *
     * @api private
     */

    WS.prototype.doOpen = function () {
      if (!this.check()) {
        // let probe timeout
        return;
      }

      var uri = this.uri();
      var protocols = this.protocols;
      var opts = {
        agent: this.agent,
        perMessageDeflate: this.perMessageDeflate
      };

      // SSL options for Node.js client
      opts.pfx = this.pfx;
      opts.key = this.key;
      opts.passphrase = this.passphrase;
      opts.cert = this.cert;
      opts.ca = this.ca;
      opts.ciphers = this.ciphers;
      opts.rejectUnauthorized = this.rejectUnauthorized;
      if (this.extraHeaders) {
        opts.headers = this.extraHeaders;
      }
      if (this.localAddress) {
        opts.localAddress = this.localAddress;
      }

      try {
        this.ws =
          this.usingBrowserWebSocket && !this.isReactNative
            ? protocols
              ? new WebSocketImpl(uri, protocols)
              : new WebSocketImpl(uri)
            : new WebSocketImpl(uri, protocols, opts);
      } catch (err) {
        return this.emit('error', err);
      }

      if (this.ws.binaryType === undefined) {
        this.supportsBinary = false;
      }

      if (this.ws.supports && this.ws.supports.binary) {
        this.supportsBinary = true;
        this.ws.binaryType = 'nodebuffer';
      } else {
        this.ws.binaryType = 'arraybuffer';
      }

      this.addEventListeners();
    };

    /**
     * Adds event listeners to the socket
     *
     * @api private
     */

    WS.prototype.addEventListeners = function () {
      var self = this;

      this.ws.onopen = function () {
        self.onOpen();
      };
      this.ws.onclose = function () {
        self.onClose();
      };
      this.ws.onmessage = function (ev) {
        self.onData(ev.data);
      };
      this.ws.onerror = function (e) {
        self.onError('websocket error', e);
      };
    };

    /**
     * Writes data to socket.
     *
     * @param {Array} array of packets.
     * @api private
     */

    WS.prototype.write = function (packets) {
      var self = this;
      this.writable = false;

      // encodePacket efficient as it uses WS framing
      // no need for encodePayload
      var total = packets.length;
      for (var i = 0, l = total; i < l; i++) {
        (function (packet) {
          browser$2.encodePacket(packet, self.supportsBinary, function (data) {
            if (!self.usingBrowserWebSocket) {
              // always create a new object (GH-437)
              var opts = {};
              if (packet.options) {
                opts.compress = packet.options.compress;
              }

              if (self.perMessageDeflate) {
                var len = 'string' === typeof data ? Buffer.byteLength(data) : data.length;
                if (len < self.perMessageDeflate.threshold) {
                  opts.compress = false;
                }
              }
            }

            // Sometimes the websocket has already been closed but the browser didn't
            // have a chance of informing us about it yet, in that case send will
            // throw an error
            try {
              if (self.usingBrowserWebSocket) {
                // TypeError is thrown when passing the second argument on Safari
                self.ws.send(data);
              } else {
                self.ws.send(data, opts);
              }
            } catch (e) {
              debug$4('websocket closed before onclose event');
            }

            --total || done();
          });
        })(packets[i]);
      }

      function done () {
        self.emit('flush');

        // fake drain
        // defer to next tick to allow Socket to clear writeBuffer
        setTimeout(function () {
          self.writable = true;
          self.emit('drain');
        }, 0);
      }
    };

    /**
     * Called upon close
     *
     * @api private
     */

    WS.prototype.onClose = function () {
      transport.prototype.onClose.call(this);
    };

    /**
     * Closes socket.
     *
     * @api private
     */

    WS.prototype.doClose = function () {
      if (typeof this.ws !== 'undefined') {
        this.ws.close();
      }
    };

    /**
     * Generates uri for connection.
     *
     * @api private
     */

    WS.prototype.uri = function () {
      var query = this.query || {};
      var schema = this.secure ? 'wss' : 'ws';
      var port = '';

      // avoid port if default for schema
      if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
        ('ws' === schema && Number(this.port) !== 80))) {
        port = ':' + this.port;
      }

      // append timestamp to URI
      if (this.timestampRequests) {
        query[this.timestampParam] = yeast_1();
      }

      // communicate binary support capabilities
      if (!this.supportsBinary) {
        query.b64 = 1;
      }

      query = parseqs.encode(query);

      // prepend ? to query
      if (query.length) {
        query = '?' + query;
      }

      var ipv6 = this.hostname.indexOf(':') !== -1;
      return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
    };

    /**
     * Feature detection for WebSocket.
     *
     * @return {Boolean} whether this transport is available.
     * @api public
     */

    WS.prototype.check = function () {
      return !!WebSocketImpl && !('__initialize' in WebSocketImpl && this.name === WS.prototype.name);
    };

    /**
     * Module dependencies
     */






    /**
     * Export transports.
     */

    var polling_1 = polling$1;
    var websocket_1 = websocket;

    /**
     * Polling transport polymorphic constructor.
     * Decides on xhr vs jsonp based on feature detection.
     *
     * @api private
     */

    function polling$1 (opts) {
      var xhr;
      var xd = false;
      var xs = false;
      var jsonp = false !== opts.jsonp;

      if (typeof location !== 'undefined') {
        var isSSL = 'https:' === location.protocol;
        var port = location.port;

        // some user agents have empty `location.port`
        if (!port) {
          port = isSSL ? 443 : 80;
        }

        xd = opts.hostname !== location.hostname || port !== opts.port;
        xs = opts.secure !== isSSL;
      }

      opts.xdomain = xd;
      opts.xscheme = xs;
      xhr = new xmlhttprequest(opts);

      if ('open' in xhr && !opts.forceJSONP) {
        return new pollingXhr(opts);
      } else {
        if (!jsonp) throw new Error('JSONP disabled');
        return new pollingJsonp(opts);
      }
    }

    var transports = {
    	polling: polling_1,
    	websocket: websocket_1
    };

    var indexOf = [].indexOf;

    var indexof = function(arr, obj){
      if (indexOf) return arr.indexOf(obj);
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj) return i;
      }
      return -1;
    };

    /**
     * Module dependencies.
     */



    var debug$5 = browser('engine.io-client:socket');





    /**
     * Module exports.
     */

    var socket = Socket;

    /**
     * Socket constructor.
     *
     * @param {String|Object} uri or options
     * @param {Object} options
     * @api public
     */

    function Socket (uri, opts) {
      if (!(this instanceof Socket)) return new Socket(uri, opts);

      opts = opts || {};

      if (uri && 'object' === typeof uri) {
        opts = uri;
        uri = null;
      }

      if (uri) {
        uri = parseuri(uri);
        opts.hostname = uri.host;
        opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
        opts.port = uri.port;
        if (uri.query) opts.query = uri.query;
      } else if (opts.host) {
        opts.hostname = parseuri(opts.host).host;
      }

      this.secure = null != opts.secure ? opts.secure
        : (typeof location !== 'undefined' && 'https:' === location.protocol);

      if (opts.hostname && !opts.port) {
        // if no port is specified manually, use the protocol default
        opts.port = this.secure ? '443' : '80';
      }

      this.agent = opts.agent || false;
      this.hostname = opts.hostname ||
        (typeof location !== 'undefined' ? location.hostname : 'localhost');
      this.port = opts.port || (typeof location !== 'undefined' && location.port
          ? location.port
          : (this.secure ? 443 : 80));
      this.query = opts.query || {};
      if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
      this.upgrade = false !== opts.upgrade;
      this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
      this.forceJSONP = !!opts.forceJSONP;
      this.jsonp = false !== opts.jsonp;
      this.forceBase64 = !!opts.forceBase64;
      this.enablesXDR = !!opts.enablesXDR;
      this.withCredentials = false !== opts.withCredentials;
      this.timestampParam = opts.timestampParam || 't';
      this.timestampRequests = opts.timestampRequests;
      this.transports = opts.transports || ['polling', 'websocket'];
      this.transportOptions = opts.transportOptions || {};
      this.readyState = '';
      this.writeBuffer = [];
      this.prevBufferLen = 0;
      this.policyPort = opts.policyPort || 843;
      this.rememberUpgrade = opts.rememberUpgrade || false;
      this.binaryType = null;
      this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
      this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

      if (true === this.perMessageDeflate) this.perMessageDeflate = {};
      if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
        this.perMessageDeflate.threshold = 1024;
      }

      // SSL options for Node.js client
      this.pfx = opts.pfx || null;
      this.key = opts.key || null;
      this.passphrase = opts.passphrase || null;
      this.cert = opts.cert || null;
      this.ca = opts.ca || null;
      this.ciphers = opts.ciphers || null;
      this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
      this.forceNode = !!opts.forceNode;

      // detect ReactNative environment
      this.isReactNative = (typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative');

      // other options for Node.js or ReactNative client
      if (typeof self === 'undefined' || this.isReactNative) {
        if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
          this.extraHeaders = opts.extraHeaders;
        }

        if (opts.localAddress) {
          this.localAddress = opts.localAddress;
        }
      }

      // set on handshake
      this.id = null;
      this.upgrades = null;
      this.pingInterval = null;
      this.pingTimeout = null;

      // set on heartbeat
      this.pingIntervalTimer = null;
      this.pingTimeoutTimer = null;

      this.open();
    }

    Socket.priorWebsocketSuccess = false;

    /**
     * Mix in `Emitter`.
     */

    componentEmitter$1(Socket.prototype);

    /**
     * Protocol version.
     *
     * @api public
     */

    Socket.protocol = browser$2.protocol; // this is an int

    /**
     * Expose deps for legacy compatibility
     * and standalone browser access.
     */

    Socket.Socket = Socket;
    Socket.Transport = transport;
    Socket.transports = transports;
    Socket.parser = browser$2;

    /**
     * Creates transport of the given type.
     *
     * @param {String} transport name
     * @return {Transport}
     * @api private
     */

    Socket.prototype.createTransport = function (name) {
      debug$5('creating transport "%s"', name);
      var query = clone(this.query);

      // append engine.io protocol identifier
      query.EIO = browser$2.protocol;

      // transport name
      query.transport = name;

      // per-transport options
      var options = this.transportOptions[name] || {};

      // session id if we already have one
      if (this.id) query.sid = this.id;

      var transport = new transports[name]({
        query: query,
        socket: this,
        agent: options.agent || this.agent,
        hostname: options.hostname || this.hostname,
        port: options.port || this.port,
        secure: options.secure || this.secure,
        path: options.path || this.path,
        forceJSONP: options.forceJSONP || this.forceJSONP,
        jsonp: options.jsonp || this.jsonp,
        forceBase64: options.forceBase64 || this.forceBase64,
        enablesXDR: options.enablesXDR || this.enablesXDR,
        withCredentials: options.withCredentials || this.withCredentials,
        timestampRequests: options.timestampRequests || this.timestampRequests,
        timestampParam: options.timestampParam || this.timestampParam,
        policyPort: options.policyPort || this.policyPort,
        pfx: options.pfx || this.pfx,
        key: options.key || this.key,
        passphrase: options.passphrase || this.passphrase,
        cert: options.cert || this.cert,
        ca: options.ca || this.ca,
        ciphers: options.ciphers || this.ciphers,
        rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
        perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
        extraHeaders: options.extraHeaders || this.extraHeaders,
        forceNode: options.forceNode || this.forceNode,
        localAddress: options.localAddress || this.localAddress,
        requestTimeout: options.requestTimeout || this.requestTimeout,
        protocols: options.protocols || void (0),
        isReactNative: this.isReactNative
      });

      return transport;
    };

    function clone (obj) {
      var o = {};
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          o[i] = obj[i];
        }
      }
      return o;
    }

    /**
     * Initializes transport to use and starts probe.
     *
     * @api private
     */
    Socket.prototype.open = function () {
      var transport;
      if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
        transport = 'websocket';
      } else if (0 === this.transports.length) {
        // Emit error on next tick so it can be listened to
        var self = this;
        setTimeout(function () {
          self.emit('error', 'No transports available');
        }, 0);
        return;
      } else {
        transport = this.transports[0];
      }
      this.readyState = 'opening';

      // Retry with the next transport if the transport is disabled (jsonp: false)
      try {
        transport = this.createTransport(transport);
      } catch (e) {
        this.transports.shift();
        this.open();
        return;
      }

      transport.open();
      this.setTransport(transport);
    };

    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @api private
     */

    Socket.prototype.setTransport = function (transport) {
      debug$5('setting transport %s', transport.name);
      var self = this;

      if (this.transport) {
        debug$5('clearing existing transport %s', this.transport.name);
        this.transport.removeAllListeners();
      }

      // set up transport
      this.transport = transport;

      // set up transport listeners
      transport
      .on('drain', function () {
        self.onDrain();
      })
      .on('packet', function (packet) {
        self.onPacket(packet);
      })
      .on('error', function (e) {
        self.onError(e);
      })
      .on('close', function () {
        self.onClose('transport close');
      });
    };

    /**
     * Probes a transport.
     *
     * @param {String} transport name
     * @api private
     */

    Socket.prototype.probe = function (name) {
      debug$5('probing transport "%s"', name);
      var transport = this.createTransport(name, { probe: 1 });
      var failed = false;
      var self = this;

      Socket.priorWebsocketSuccess = false;

      function onTransportOpen () {
        if (self.onlyBinaryUpgrades) {
          var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
          failed = failed || upgradeLosesBinary;
        }
        if (failed) return;

        debug$5('probe transport "%s" opened', name);
        transport.send([{ type: 'ping', data: 'probe' }]);
        transport.once('packet', function (msg) {
          if (failed) return;
          if ('pong' === msg.type && 'probe' === msg.data) {
            debug$5('probe transport "%s" pong', name);
            self.upgrading = true;
            self.emit('upgrading', transport);
            if (!transport) return;
            Socket.priorWebsocketSuccess = 'websocket' === transport.name;

            debug$5('pausing current transport "%s"', self.transport.name);
            self.transport.pause(function () {
              if (failed) return;
              if ('closed' === self.readyState) return;
              debug$5('changing transport and sending upgrade packet');

              cleanup();

              self.setTransport(transport);
              transport.send([{ type: 'upgrade' }]);
              self.emit('upgrade', transport);
              transport = null;
              self.upgrading = false;
              self.flush();
            });
          } else {
            debug$5('probe transport "%s" failed', name);
            var err = new Error('probe error');
            err.transport = transport.name;
            self.emit('upgradeError', err);
          }
        });
      }

      function freezeTransport () {
        if (failed) return;

        // Any callback called by transport should be ignored since now
        failed = true;

        cleanup();

        transport.close();
        transport = null;
      }

      // Handle any error that happens while probing
      function onerror (err) {
        var error = new Error('probe error: ' + err);
        error.transport = transport.name;

        freezeTransport();

        debug$5('probe transport "%s" failed because of error: %s', name, err);

        self.emit('upgradeError', error);
      }

      function onTransportClose () {
        onerror('transport closed');
      }

      // When the socket is closed while we're probing
      function onclose () {
        onerror('socket closed');
      }

      // When the socket is upgraded while we're probing
      function onupgrade (to) {
        if (transport && to.name !== transport.name) {
          debug$5('"%s" works - aborting "%s"', to.name, transport.name);
          freezeTransport();
        }
      }

      // Remove all listeners on the transport and on self
      function cleanup () {
        transport.removeListener('open', onTransportOpen);
        transport.removeListener('error', onerror);
        transport.removeListener('close', onTransportClose);
        self.removeListener('close', onclose);
        self.removeListener('upgrading', onupgrade);
      }

      transport.once('open', onTransportOpen);
      transport.once('error', onerror);
      transport.once('close', onTransportClose);

      this.once('close', onclose);
      this.once('upgrading', onupgrade);

      transport.open();
    };

    /**
     * Called when connection is deemed open.
     *
     * @api public
     */

    Socket.prototype.onOpen = function () {
      debug$5('socket open');
      this.readyState = 'open';
      Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
      this.emit('open');
      this.flush();

      // we check for `readyState` in case an `open`
      // listener already closed the socket
      if ('open' === this.readyState && this.upgrade && this.transport.pause) {
        debug$5('starting upgrade probes');
        for (var i = 0, l = this.upgrades.length; i < l; i++) {
          this.probe(this.upgrades[i]);
        }
      }
    };

    /**
     * Handles a packet.
     *
     * @api private
     */

    Socket.prototype.onPacket = function (packet) {
      if ('opening' === this.readyState || 'open' === this.readyState ||
          'closing' === this.readyState) {
        debug$5('socket receive: type "%s", data "%s"', packet.type, packet.data);

        this.emit('packet', packet);

        // Socket is live - any packet counts
        this.emit('heartbeat');

        switch (packet.type) {
          case 'open':
            this.onHandshake(JSON.parse(packet.data));
            break;

          case 'pong':
            this.setPing();
            this.emit('pong');
            break;

          case 'error':
            var err = new Error('server error');
            err.code = packet.data;
            this.onError(err);
            break;

          case 'message':
            this.emit('data', packet.data);
            this.emit('message', packet.data);
            break;
        }
      } else {
        debug$5('packet received with socket readyState "%s"', this.readyState);
      }
    };

    /**
     * Called upon handshake completion.
     *
     * @param {Object} handshake obj
     * @api private
     */

    Socket.prototype.onHandshake = function (data) {
      this.emit('handshake', data);
      this.id = data.sid;
      this.transport.query.sid = data.sid;
      this.upgrades = this.filterUpgrades(data.upgrades);
      this.pingInterval = data.pingInterval;
      this.pingTimeout = data.pingTimeout;
      this.onOpen();
      // In case open handler closes socket
      if ('closed' === this.readyState) return;
      this.setPing();

      // Prolong liveness of socket on heartbeat
      this.removeListener('heartbeat', this.onHeartbeat);
      this.on('heartbeat', this.onHeartbeat);
    };

    /**
     * Resets ping timeout.
     *
     * @api private
     */

    Socket.prototype.onHeartbeat = function (timeout) {
      clearTimeout(this.pingTimeoutTimer);
      var self = this;
      self.pingTimeoutTimer = setTimeout(function () {
        if ('closed' === self.readyState) return;
        self.onClose('ping timeout');
      }, timeout || (self.pingInterval + self.pingTimeout));
    };

    /**
     * Pings server every `this.pingInterval` and expects response
     * within `this.pingTimeout` or closes connection.
     *
     * @api private
     */

    Socket.prototype.setPing = function () {
      var self = this;
      clearTimeout(self.pingIntervalTimer);
      self.pingIntervalTimer = setTimeout(function () {
        debug$5('writing ping packet - expecting pong within %sms', self.pingTimeout);
        self.ping();
        self.onHeartbeat(self.pingTimeout);
      }, self.pingInterval);
    };

    /**
    * Sends a ping packet.
    *
    * @api private
    */

    Socket.prototype.ping = function () {
      var self = this;
      this.sendPacket('ping', function () {
        self.emit('ping');
      });
    };

    /**
     * Called on `drain` event
     *
     * @api private
     */

    Socket.prototype.onDrain = function () {
      this.writeBuffer.splice(0, this.prevBufferLen);

      // setting prevBufferLen = 0 is very important
      // for example, when upgrading, upgrade packet is sent over,
      // and a nonzero prevBufferLen could cause problems on `drain`
      this.prevBufferLen = 0;

      if (0 === this.writeBuffer.length) {
        this.emit('drain');
      } else {
        this.flush();
      }
    };

    /**
     * Flush write buffers.
     *
     * @api private
     */

    Socket.prototype.flush = function () {
      if ('closed' !== this.readyState && this.transport.writable &&
        !this.upgrading && this.writeBuffer.length) {
        debug$5('flushing %d packets in socket', this.writeBuffer.length);
        this.transport.send(this.writeBuffer);
        // keep track of current length of writeBuffer
        // splice writeBuffer and callbackBuffer on `drain`
        this.prevBufferLen = this.writeBuffer.length;
        this.emit('flush');
      }
    };

    /**
     * Sends a message.
     *
     * @param {String} message.
     * @param {Function} callback function.
     * @param {Object} options.
     * @return {Socket} for chaining.
     * @api public
     */

    Socket.prototype.write =
    Socket.prototype.send = function (msg, options, fn) {
      this.sendPacket('message', msg, options, fn);
      return this;
    };

    /**
     * Sends a packet.
     *
     * @param {String} packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} callback function.
     * @api private
     */

    Socket.prototype.sendPacket = function (type, data, options, fn) {
      if ('function' === typeof data) {
        fn = data;
        data = undefined;
      }

      if ('function' === typeof options) {
        fn = options;
        options = null;
      }

      if ('closing' === this.readyState || 'closed' === this.readyState) {
        return;
      }

      options = options || {};
      options.compress = false !== options.compress;

      var packet = {
        type: type,
        data: data,
        options: options
      };
      this.emit('packetCreate', packet);
      this.writeBuffer.push(packet);
      if (fn) this.once('flush', fn);
      this.flush();
    };

    /**
     * Closes the connection.
     *
     * @api private
     */

    Socket.prototype.close = function () {
      if ('opening' === this.readyState || 'open' === this.readyState) {
        this.readyState = 'closing';

        var self = this;

        if (this.writeBuffer.length) {
          this.once('drain', function () {
            if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          });
        } else if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      }

      function close () {
        self.onClose('forced close');
        debug$5('socket closing - telling transport to close');
        self.transport.close();
      }

      function cleanupAndClose () {
        self.removeListener('upgrade', cleanupAndClose);
        self.removeListener('upgradeError', cleanupAndClose);
        close();
      }

      function waitForUpgrade () {
        // wait for upgrade to finish since we can't send packets while pausing a transport
        self.once('upgrade', cleanupAndClose);
        self.once('upgradeError', cleanupAndClose);
      }

      return this;
    };

    /**
     * Called upon transport error
     *
     * @api private
     */

    Socket.prototype.onError = function (err) {
      debug$5('socket error %j', err);
      Socket.priorWebsocketSuccess = false;
      this.emit('error', err);
      this.onClose('transport error', err);
    };

    /**
     * Called upon transport close.
     *
     * @api private
     */

    Socket.prototype.onClose = function (reason, desc) {
      if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
        debug$5('socket close with reason: "%s"', reason);
        var self = this;

        // clear timers
        clearTimeout(this.pingIntervalTimer);
        clearTimeout(this.pingTimeoutTimer);

        // stop event from firing again for transport
        this.transport.removeAllListeners('close');

        // ensure transport won't stay open
        this.transport.close();

        // ignore further transport communication
        this.transport.removeAllListeners();

        // set ready state
        this.readyState = 'closed';

        // clear session id
        this.id = null;

        // emit close event
        this.emit('close', reason, desc);

        // clean buffers after, so users can still
        // grab the buffers on `close` event
        self.writeBuffer = [];
        self.prevBufferLen = 0;
      }
    };

    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} server upgrades
     * @api private
     *
     */

    Socket.prototype.filterUpgrades = function (upgrades) {
      var filteredUpgrades = [];
      for (var i = 0, j = upgrades.length; i < j; i++) {
        if (~indexof(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
      }
      return filteredUpgrades;
    };

    var lib = socket;

    /**
     * Exports parser
     *
     * @api public
     *
     */
    var parser = browser$2;
    lib.parser = parser;

    var toArray_1 = toArray;

    function toArray(list, index) {
        var array = [];

        index = index || 0;

        for (var i = index || 0; i < list.length; i++) {
            array[i - index] = list[i];
        }

        return array
    }

    /**
     * Module exports.
     */

    var on_1 = on;

    /**
     * Helper for subscriptions.
     *
     * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
     * @param {String} event name
     * @param {Function} callback
     * @api public
     */

    function on (obj, ev, fn) {
      obj.on(ev, fn);
      return {
        destroy: function () {
          obj.removeListener(ev, fn);
        }
      };
    }

    /**
     * Slice reference.
     */

    var slice = [].slice;

    /**
     * Bind `obj` to `fn`.
     *
     * @param {Object} obj
     * @param {Function|String} fn or string
     * @return {Function}
     * @api public
     */

    var componentBind = function(obj, fn){
      if ('string' == typeof fn) fn = obj[fn];
      if ('function' != typeof fn) throw new Error('bind() requires a function');
      var args = slice.call(arguments, 2);
      return function(){
        return fn.apply(obj, args.concat(slice.call(arguments)));
      }
    };

    var socket$1 = createCommonjsModule(function (module, exports) {
    /**
     * Module dependencies.
     */






    var debug = browser('socket.io-client:socket');



    /**
     * Module exports.
     */

    module.exports = exports = Socket;

    /**
     * Internal events (blacklisted).
     * These events can't be emitted by the user.
     *
     * @api private
     */

    var events = {
      connect: 1,
      connect_error: 1,
      connect_timeout: 1,
      connecting: 1,
      disconnect: 1,
      error: 1,
      reconnect: 1,
      reconnect_attempt: 1,
      reconnect_failed: 1,
      reconnect_error: 1,
      reconnecting: 1,
      ping: 1,
      pong: 1
    };

    /**
     * Shortcut to `Emitter#emit`.
     */

    var emit = componentEmitter.prototype.emit;

    /**
     * `Socket` constructor.
     *
     * @api public
     */

    function Socket (io, nsp, opts) {
      this.io = io;
      this.nsp = nsp;
      this.json = this; // compat
      this.ids = 0;
      this.acks = {};
      this.receiveBuffer = [];
      this.sendBuffer = [];
      this.connected = false;
      this.disconnected = true;
      this.flags = {};
      if (opts && opts.query) {
        this.query = opts.query;
      }
      if (this.io.autoConnect) this.open();
    }

    /**
     * Mix in `Emitter`.
     */

    componentEmitter(Socket.prototype);

    /**
     * Subscribe to open, close and packet events
     *
     * @api private
     */

    Socket.prototype.subEvents = function () {
      if (this.subs) return;

      var io = this.io;
      this.subs = [
        on_1(io, 'open', componentBind(this, 'onopen')),
        on_1(io, 'packet', componentBind(this, 'onpacket')),
        on_1(io, 'close', componentBind(this, 'onclose'))
      ];
    };

    /**
     * "Opens" the socket.
     *
     * @api public
     */

    Socket.prototype.open =
    Socket.prototype.connect = function () {
      if (this.connected) return this;

      this.subEvents();
      this.io.open(); // ensure open
      if ('open' === this.io.readyState) this.onopen();
      this.emit('connecting');
      return this;
    };

    /**
     * Sends a `message` event.
     *
     * @return {Socket} self
     * @api public
     */

    Socket.prototype.send = function () {
      var args = toArray_1(arguments);
      args.unshift('message');
      this.emit.apply(this, args);
      return this;
    };

    /**
     * Override `emit`.
     * If the event is in `events`, it's emitted normally.
     *
     * @param {String} event name
     * @return {Socket} self
     * @api public
     */

    Socket.prototype.emit = function (ev) {
      if (events.hasOwnProperty(ev)) {
        emit.apply(this, arguments);
        return this;
      }

      var args = toArray_1(arguments);
      var packet = {
        type: (this.flags.binary !== undefined ? this.flags.binary : hasBinary2(args)) ? socket_ioParser.BINARY_EVENT : socket_ioParser.EVENT,
        data: args
      };

      packet.options = {};
      packet.options.compress = !this.flags || false !== this.flags.compress;

      // event ack callback
      if ('function' === typeof args[args.length - 1]) {
        debug('emitting packet with ack id %d', this.ids);
        this.acks[this.ids] = args.pop();
        packet.id = this.ids++;
      }

      if (this.connected) {
        this.packet(packet);
      } else {
        this.sendBuffer.push(packet);
      }

      this.flags = {};

      return this;
    };

    /**
     * Sends a packet.
     *
     * @param {Object} packet
     * @api private
     */

    Socket.prototype.packet = function (packet) {
      packet.nsp = this.nsp;
      this.io.packet(packet);
    };

    /**
     * Called upon engine `open`.
     *
     * @api private
     */

    Socket.prototype.onopen = function () {
      debug('transport is open - connecting');

      // write connect packet if necessary
      if ('/' !== this.nsp) {
        if (this.query) {
          var query = typeof this.query === 'object' ? parseqs.encode(this.query) : this.query;
          debug('sending connect packet with query %s', query);
          this.packet({type: socket_ioParser.CONNECT, query: query});
        } else {
          this.packet({type: socket_ioParser.CONNECT});
        }
      }
    };

    /**
     * Called upon engine `close`.
     *
     * @param {String} reason
     * @api private
     */

    Socket.prototype.onclose = function (reason) {
      debug('close (%s)', reason);
      this.connected = false;
      this.disconnected = true;
      delete this.id;
      this.emit('disconnect', reason);
    };

    /**
     * Called with socket packet.
     *
     * @param {Object} packet
     * @api private
     */

    Socket.prototype.onpacket = function (packet) {
      var sameNamespace = packet.nsp === this.nsp;
      var rootNamespaceError = packet.type === socket_ioParser.ERROR && packet.nsp === '/';

      if (!sameNamespace && !rootNamespaceError) return;

      switch (packet.type) {
        case socket_ioParser.CONNECT:
          this.onconnect();
          break;

        case socket_ioParser.EVENT:
          this.onevent(packet);
          break;

        case socket_ioParser.BINARY_EVENT:
          this.onevent(packet);
          break;

        case socket_ioParser.ACK:
          this.onack(packet);
          break;

        case socket_ioParser.BINARY_ACK:
          this.onack(packet);
          break;

        case socket_ioParser.DISCONNECT:
          this.ondisconnect();
          break;

        case socket_ioParser.ERROR:
          this.emit('error', packet.data);
          break;
      }
    };

    /**
     * Called upon a server event.
     *
     * @param {Object} packet
     * @api private
     */

    Socket.prototype.onevent = function (packet) {
      var args = packet.data || [];
      debug('emitting event %j', args);

      if (null != packet.id) {
        debug('attaching ack callback to event');
        args.push(this.ack(packet.id));
      }

      if (this.connected) {
        emit.apply(this, args);
      } else {
        this.receiveBuffer.push(args);
      }
    };

    /**
     * Produces an ack callback to emit with an event.
     *
     * @api private
     */

    Socket.prototype.ack = function (id) {
      var self = this;
      var sent = false;
      return function () {
        // prevent double callbacks
        if (sent) return;
        sent = true;
        var args = toArray_1(arguments);
        debug('sending ack %j', args);

        self.packet({
          type: hasBinary2(args) ? socket_ioParser.BINARY_ACK : socket_ioParser.ACK,
          id: id,
          data: args
        });
      };
    };

    /**
     * Called upon a server acknowlegement.
     *
     * @param {Object} packet
     * @api private
     */

    Socket.prototype.onack = function (packet) {
      var ack = this.acks[packet.id];
      if ('function' === typeof ack) {
        debug('calling ack %s with %j', packet.id, packet.data);
        ack.apply(this, packet.data);
        delete this.acks[packet.id];
      } else {
        debug('bad ack %s', packet.id);
      }
    };

    /**
     * Called upon server connect.
     *
     * @api private
     */

    Socket.prototype.onconnect = function () {
      this.connected = true;
      this.disconnected = false;
      this.emit('connect');
      this.emitBuffered();
    };

    /**
     * Emit buffered events (received and emitted).
     *
     * @api private
     */

    Socket.prototype.emitBuffered = function () {
      var i;
      for (i = 0; i < this.receiveBuffer.length; i++) {
        emit.apply(this, this.receiveBuffer[i]);
      }
      this.receiveBuffer = [];

      for (i = 0; i < this.sendBuffer.length; i++) {
        this.packet(this.sendBuffer[i]);
      }
      this.sendBuffer = [];
    };

    /**
     * Called upon server disconnect.
     *
     * @api private
     */

    Socket.prototype.ondisconnect = function () {
      debug('server disconnect (%s)', this.nsp);
      this.destroy();
      this.onclose('io server disconnect');
    };

    /**
     * Called upon forced client/server side disconnections,
     * this method ensures the manager stops tracking us and
     * that reconnections don't get triggered for this.
     *
     * @api private.
     */

    Socket.prototype.destroy = function () {
      if (this.subs) {
        // clean subscriptions to avoid reconnections
        for (var i = 0; i < this.subs.length; i++) {
          this.subs[i].destroy();
        }
        this.subs = null;
      }

      this.io.destroy(this);
    };

    /**
     * Disconnects the socket manually.
     *
     * @return {Socket} self
     * @api public
     */

    Socket.prototype.close =
    Socket.prototype.disconnect = function () {
      if (this.connected) {
        debug('performing disconnect (%s)', this.nsp);
        this.packet({ type: socket_ioParser.DISCONNECT });
      }

      // remove socket from pool
      this.destroy();

      if (this.connected) {
        // fire events
        this.onclose('io client disconnect');
      }
      return this;
    };

    /**
     * Sets the compress flag.
     *
     * @param {Boolean} if `true`, compresses the sending data
     * @return {Socket} self
     * @api public
     */

    Socket.prototype.compress = function (compress) {
      this.flags.compress = compress;
      return this;
    };

    /**
     * Sets the binary flag
     *
     * @param {Boolean} whether the emitted data contains binary
     * @return {Socket} self
     * @api public
     */

    Socket.prototype.binary = function (binary) {
      this.flags.binary = binary;
      return this;
    };
    });

    /**
     * Expose `Backoff`.
     */

    var backo2 = Backoff;

    /**
     * Initialize backoff timer with `opts`.
     *
     * - `min` initial timeout in milliseconds [100]
     * - `max` max timeout [10000]
     * - `jitter` [0]
     * - `factor` [2]
     *
     * @param {Object} opts
     * @api public
     */

    function Backoff(opts) {
      opts = opts || {};
      this.ms = opts.min || 100;
      this.max = opts.max || 10000;
      this.factor = opts.factor || 2;
      this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
      this.attempts = 0;
    }

    /**
     * Return the backoff duration.
     *
     * @return {Number}
     * @api public
     */

    Backoff.prototype.duration = function(){
      var ms = this.ms * Math.pow(this.factor, this.attempts++);
      if (this.jitter) {
        var rand =  Math.random();
        var deviation = Math.floor(rand * this.jitter * ms);
        ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
      }
      return Math.min(ms, this.max) | 0;
    };

    /**
     * Reset the number of attempts.
     *
     * @api public
     */

    Backoff.prototype.reset = function(){
      this.attempts = 0;
    };

    /**
     * Set the minimum duration
     *
     * @api public
     */

    Backoff.prototype.setMin = function(min){
      this.ms = min;
    };

    /**
     * Set the maximum duration
     *
     * @api public
     */

    Backoff.prototype.setMax = function(max){
      this.max = max;
    };

    /**
     * Set the jitter
     *
     * @api public
     */

    Backoff.prototype.setJitter = function(jitter){
      this.jitter = jitter;
    };

    /**
     * Module dependencies.
     */







    var debug$6 = browser('socket.io-client:manager');



    /**
     * IE6+ hasOwnProperty
     */

    var has = Object.prototype.hasOwnProperty;

    /**
     * Module exports
     */

    var manager = Manager;

    /**
     * `Manager` constructor.
     *
     * @param {String} engine instance or engine uri/opts
     * @param {Object} options
     * @api public
     */

    function Manager (uri, opts) {
      if (!(this instanceof Manager)) return new Manager(uri, opts);
      if (uri && ('object' === typeof uri)) {
        opts = uri;
        uri = undefined;
      }
      opts = opts || {};

      opts.path = opts.path || '/socket.io';
      this.nsps = {};
      this.subs = [];
      this.opts = opts;
      this.reconnection(opts.reconnection !== false);
      this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
      this.reconnectionDelay(opts.reconnectionDelay || 1000);
      this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
      this.randomizationFactor(opts.randomizationFactor || 0.5);
      this.backoff = new backo2({
        min: this.reconnectionDelay(),
        max: this.reconnectionDelayMax(),
        jitter: this.randomizationFactor()
      });
      this.timeout(null == opts.timeout ? 20000 : opts.timeout);
      this.readyState = 'closed';
      this.uri = uri;
      this.connecting = [];
      this.lastPing = null;
      this.encoding = false;
      this.packetBuffer = [];
      var _parser = opts.parser || socket_ioParser;
      this.encoder = new _parser.Encoder();
      this.decoder = new _parser.Decoder();
      this.autoConnect = opts.autoConnect !== false;
      if (this.autoConnect) this.open();
    }

    /**
     * Propagate given event to sockets and emit on `this`
     *
     * @api private
     */

    Manager.prototype.emitAll = function () {
      this.emit.apply(this, arguments);
      for (var nsp in this.nsps) {
        if (has.call(this.nsps, nsp)) {
          this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
        }
      }
    };

    /**
     * Update `socket.id` of all sockets
     *
     * @api private
     */

    Manager.prototype.updateSocketIds = function () {
      for (var nsp in this.nsps) {
        if (has.call(this.nsps, nsp)) {
          this.nsps[nsp].id = this.generateId(nsp);
        }
      }
    };

    /**
     * generate `socket.id` for the given `nsp`
     *
     * @param {String} nsp
     * @return {String}
     * @api private
     */

    Manager.prototype.generateId = function (nsp) {
      return (nsp === '/' ? '' : (nsp + '#')) + this.engine.id;
    };

    /**
     * Mix in `Emitter`.
     */

    componentEmitter(Manager.prototype);

    /**
     * Sets the `reconnection` config.
     *
     * @param {Boolean} true/false if it should automatically reconnect
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.reconnection = function (v) {
      if (!arguments.length) return this._reconnection;
      this._reconnection = !!v;
      return this;
    };

    /**
     * Sets the reconnection attempts config.
     *
     * @param {Number} max reconnection attempts before giving up
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.reconnectionAttempts = function (v) {
      if (!arguments.length) return this._reconnectionAttempts;
      this._reconnectionAttempts = v;
      return this;
    };

    /**
     * Sets the delay between reconnections.
     *
     * @param {Number} delay
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.reconnectionDelay = function (v) {
      if (!arguments.length) return this._reconnectionDelay;
      this._reconnectionDelay = v;
      this.backoff && this.backoff.setMin(v);
      return this;
    };

    Manager.prototype.randomizationFactor = function (v) {
      if (!arguments.length) return this._randomizationFactor;
      this._randomizationFactor = v;
      this.backoff && this.backoff.setJitter(v);
      return this;
    };

    /**
     * Sets the maximum delay between reconnections.
     *
     * @param {Number} delay
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.reconnectionDelayMax = function (v) {
      if (!arguments.length) return this._reconnectionDelayMax;
      this._reconnectionDelayMax = v;
      this.backoff && this.backoff.setMax(v);
      return this;
    };

    /**
     * Sets the connection timeout. `false` to disable
     *
     * @return {Manager} self or value
     * @api public
     */

    Manager.prototype.timeout = function (v) {
      if (!arguments.length) return this._timeout;
      this._timeout = v;
      return this;
    };

    /**
     * Starts trying to reconnect if reconnection is enabled and we have not
     * started reconnecting yet
     *
     * @api private
     */

    Manager.prototype.maybeReconnectOnOpen = function () {
      // Only try to reconnect if it's the first time we're connecting
      if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
        // keeps reconnection from firing twice for the same reconnection loop
        this.reconnect();
      }
    };

    /**
     * Sets the current transport `socket`.
     *
     * @param {Function} optional, callback
     * @return {Manager} self
     * @api public
     */

    Manager.prototype.open =
    Manager.prototype.connect = function (fn, opts) {
      debug$6('readyState %s', this.readyState);
      if (~this.readyState.indexOf('open')) return this;

      debug$6('opening %s', this.uri);
      this.engine = lib(this.uri, this.opts);
      var socket = this.engine;
      var self = this;
      this.readyState = 'opening';
      this.skipReconnect = false;

      // emit `open`
      var openSub = on_1(socket, 'open', function () {
        self.onopen();
        fn && fn();
      });

      // emit `connect_error`
      var errorSub = on_1(socket, 'error', function (data) {
        debug$6('connect_error');
        self.cleanup();
        self.readyState = 'closed';
        self.emitAll('connect_error', data);
        if (fn) {
          var err = new Error('Connection error');
          err.data = data;
          fn(err);
        } else {
          // Only do this if there is no fn to handle the error
          self.maybeReconnectOnOpen();
        }
      });

      // emit `connect_timeout`
      if (false !== this._timeout) {
        var timeout = this._timeout;
        debug$6('connect attempt will timeout after %d', timeout);

        // set timer
        var timer = setTimeout(function () {
          debug$6('connect attempt timed out after %d', timeout);
          openSub.destroy();
          socket.close();
          socket.emit('error', 'timeout');
          self.emitAll('connect_timeout', timeout);
        }, timeout);

        this.subs.push({
          destroy: function () {
            clearTimeout(timer);
          }
        });
      }

      this.subs.push(openSub);
      this.subs.push(errorSub);

      return this;
    };

    /**
     * Called upon transport open.
     *
     * @api private
     */

    Manager.prototype.onopen = function () {
      debug$6('open');

      // clear old subs
      this.cleanup();

      // mark as open
      this.readyState = 'open';
      this.emit('open');

      // add new subs
      var socket = this.engine;
      this.subs.push(on_1(socket, 'data', componentBind(this, 'ondata')));
      this.subs.push(on_1(socket, 'ping', componentBind(this, 'onping')));
      this.subs.push(on_1(socket, 'pong', componentBind(this, 'onpong')));
      this.subs.push(on_1(socket, 'error', componentBind(this, 'onerror')));
      this.subs.push(on_1(socket, 'close', componentBind(this, 'onclose')));
      this.subs.push(on_1(this.decoder, 'decoded', componentBind(this, 'ondecoded')));
    };

    /**
     * Called upon a ping.
     *
     * @api private
     */

    Manager.prototype.onping = function () {
      this.lastPing = new Date();
      this.emitAll('ping');
    };

    /**
     * Called upon a packet.
     *
     * @api private
     */

    Manager.prototype.onpong = function () {
      this.emitAll('pong', new Date() - this.lastPing);
    };

    /**
     * Called with data.
     *
     * @api private
     */

    Manager.prototype.ondata = function (data) {
      this.decoder.add(data);
    };

    /**
     * Called when parser fully decodes a packet.
     *
     * @api private
     */

    Manager.prototype.ondecoded = function (packet) {
      this.emit('packet', packet);
    };

    /**
     * Called upon socket error.
     *
     * @api private
     */

    Manager.prototype.onerror = function (err) {
      debug$6('error', err);
      this.emitAll('error', err);
    };

    /**
     * Creates a new socket for the given `nsp`.
     *
     * @return {Socket}
     * @api public
     */

    Manager.prototype.socket = function (nsp, opts) {
      var socket = this.nsps[nsp];
      if (!socket) {
        socket = new socket$1(this, nsp, opts);
        this.nsps[nsp] = socket;
        var self = this;
        socket.on('connecting', onConnecting);
        socket.on('connect', function () {
          socket.id = self.generateId(nsp);
        });

        if (this.autoConnect) {
          // manually call here since connecting event is fired before listening
          onConnecting();
        }
      }

      function onConnecting () {
        if (!~indexof(self.connecting, socket)) {
          self.connecting.push(socket);
        }
      }

      return socket;
    };

    /**
     * Called upon a socket close.
     *
     * @param {Socket} socket
     */

    Manager.prototype.destroy = function (socket) {
      var index = indexof(this.connecting, socket);
      if (~index) this.connecting.splice(index, 1);
      if (this.connecting.length) return;

      this.close();
    };

    /**
     * Writes a packet.
     *
     * @param {Object} packet
     * @api private
     */

    Manager.prototype.packet = function (packet) {
      debug$6('writing packet %j', packet);
      var self = this;
      if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

      if (!self.encoding) {
        // encode, then write to engine with result
        self.encoding = true;
        this.encoder.encode(packet, function (encodedPackets) {
          for (var i = 0; i < encodedPackets.length; i++) {
            self.engine.write(encodedPackets[i], packet.options);
          }
          self.encoding = false;
          self.processPacketQueue();
        });
      } else { // add packet to the queue
        self.packetBuffer.push(packet);
      }
    };

    /**
     * If packet buffer is non-empty, begins encoding the
     * next packet in line.
     *
     * @api private
     */

    Manager.prototype.processPacketQueue = function () {
      if (this.packetBuffer.length > 0 && !this.encoding) {
        var pack = this.packetBuffer.shift();
        this.packet(pack);
      }
    };

    /**
     * Clean up transport subscriptions and packet buffer.
     *
     * @api private
     */

    Manager.prototype.cleanup = function () {
      debug$6('cleanup');

      var subsLength = this.subs.length;
      for (var i = 0; i < subsLength; i++) {
        var sub = this.subs.shift();
        sub.destroy();
      }

      this.packetBuffer = [];
      this.encoding = false;
      this.lastPing = null;

      this.decoder.destroy();
    };

    /**
     * Close the current socket.
     *
     * @api private
     */

    Manager.prototype.close =
    Manager.prototype.disconnect = function () {
      debug$6('disconnect');
      this.skipReconnect = true;
      this.reconnecting = false;
      if ('opening' === this.readyState) {
        // `onclose` will not fire because
        // an open event never happened
        this.cleanup();
      }
      this.backoff.reset();
      this.readyState = 'closed';
      if (this.engine) this.engine.close();
    };

    /**
     * Called upon engine close.
     *
     * @api private
     */

    Manager.prototype.onclose = function (reason) {
      debug$6('onclose');

      this.cleanup();
      this.backoff.reset();
      this.readyState = 'closed';
      this.emit('close', reason);

      if (this._reconnection && !this.skipReconnect) {
        this.reconnect();
      }
    };

    /**
     * Attempt a reconnection.
     *
     * @api private
     */

    Manager.prototype.reconnect = function () {
      if (this.reconnecting || this.skipReconnect) return this;

      var self = this;

      if (this.backoff.attempts >= this._reconnectionAttempts) {
        debug$6('reconnect failed');
        this.backoff.reset();
        this.emitAll('reconnect_failed');
        this.reconnecting = false;
      } else {
        var delay = this.backoff.duration();
        debug$6('will wait %dms before reconnect attempt', delay);

        this.reconnecting = true;
        var timer = setTimeout(function () {
          if (self.skipReconnect) return;

          debug$6('attempting reconnect');
          self.emitAll('reconnect_attempt', self.backoff.attempts);
          self.emitAll('reconnecting', self.backoff.attempts);

          // check again for the case socket closed in above events
          if (self.skipReconnect) return;

          self.open(function (err) {
            if (err) {
              debug$6('reconnect attempt error');
              self.reconnecting = false;
              self.reconnect();
              self.emitAll('reconnect_error', err.data);
            } else {
              debug$6('reconnect success');
              self.onreconnect();
            }
          });
        }, delay);

        this.subs.push({
          destroy: function () {
            clearTimeout(timer);
          }
        });
      }
    };

    /**
     * Called upon successful reconnect.
     *
     * @api private
     */

    Manager.prototype.onreconnect = function () {
      var attempt = this.backoff.attempts;
      this.reconnecting = false;
      this.backoff.reset();
      this.updateSocketIds();
      this.emitAll('reconnect', attempt);
    };

    var lib$1 = createCommonjsModule(function (module, exports) {
    /**
     * Module dependencies.
     */




    var debug = browser('socket.io-client');

    /**
     * Module exports.
     */

    module.exports = exports = lookup;

    /**
     * Managers cache.
     */

    var cache = exports.managers = {};

    /**
     * Looks up an existing `Manager` for multiplexing.
     * If the user summons:
     *
     *   `io('http://localhost/a');`
     *   `io('http://localhost/b');`
     *
     * We reuse the existing instance based on same scheme/port/host,
     * and we initialize sockets for each namespace.
     *
     * @api public
     */

    function lookup (uri, opts) {
      if (typeof uri === 'object') {
        opts = uri;
        uri = undefined;
      }

      opts = opts || {};

      var parsed = url_1(uri);
      var source = parsed.source;
      var id = parsed.id;
      var path = parsed.path;
      var sameNamespace = cache[id] && path in cache[id].nsps;
      var newConnection = opts.forceNew || opts['force new connection'] ||
                          false === opts.multiplex || sameNamespace;

      var io;

      if (newConnection) {
        debug('ignoring socket cache for %s', source);
        io = manager(source, opts);
      } else {
        if (!cache[id]) {
          debug('new io instance for %s', source);
          cache[id] = manager(source, opts);
        }
        io = cache[id];
      }
      if (parsed.query && !opts.query) {
        opts.query = parsed.query;
      }
      return io.socket(parsed.path, opts);
    }

    /**
     * Protocol version.
     *
     * @api public
     */

    exports.protocol = socket_ioParser.protocol;

    /**
     * `connect`.
     *
     * @param {String} uri
     * @api public
     */

    exports.connect = lookup;

    /**
     * Expose constructors for standalone build.
     *
     * @api public
     */

    exports.Manager = manager;
    exports.Socket = socket$1;
    });
    var lib_1 = lib$1.managers;
    var lib_2 = lib$1.protocol;
    var lib_3 = lib$1.connect;
    var lib_4 = lib$1.Manager;
    var lib_5 = lib$1.Socket;

    function encode$2() {
      // URL encodes a string in base 64 containing the board code and marbles and parts codes seperated by the _ character.
      return board.encode() + urlEncode64[63] + marbles.encode() + parts.encode();
    }
    function decode$2(code, send = false) {
      // Decodes an URL encoded string in base 64 to update the board, marbles and parts accordingly.
      // Sends the board to the server if in a live room, otherwise updates the URL with the code.
      board.decode(code);
      let partsCode = false;
      if (code) partsCode = code.split(urlEncode64[63]).length === 2 ? code.split(urlEncode64[63])[1] : false;
      parts.decode(partsCode);
      marbles.decode(partsCode);
    }

    const socket$2 = writable(false);

    socket$2.connect = function (uuid, board) {
      let query = false;
      if (uuid) query = 'uuid=' + uuid;else if (board) query = 'board=' + board;
      const $socket = lib$1.connect(window.location.origin, {
        query
      });
      this.set($socket);
      $socket.on('joined', handshake => {
        decode$2(handshake.board);
        history.pushState(null, document.title, window.location.pathname + '?uuid=' + handshake.uuid);
        toastMessage.set('Joined shared room id: ' + handshake.uuid + '.');
      });
      $socket.on('board', decode$2);
      $socket.on('failed', reason => {
        this.disconnect();
        toastMessage.set('Failed to join shared room: ' + reason);
      });
      $socket.on('disconnect', reason => {
        this.disconnect();
        if (reason !== 'io client disconnect') toastMessage.set('Disconnected from shared room: ' + reason);
      });
    };

    socket$2.disconnect = function () {
      // On disconnect remove room from the url and close socket and remove it from the store.
      const url = window.location.pathname.slice(0, -'room/'.length);
      history.pushState(null, document.title, url);
      this.update($socket => {
        if ($socket) $socket.close();
        return false;
      });
    };

    socket$2.sendBoard = function () {
      // Sends encoded board and parts data to server, returns false if sockets not connected.
      const $socket = get_store_value(this);

      if ($socket) {
        $socket.emit('board', encode$2());
        return true;
      } else return false;
    };

    /* src/svelte/GameBoard.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$3 = "src/svelte/GameBoard.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	child_ctx[37] = i;
    	return child_ctx;
    }

    // (149:6) {#if ($board.marble && $board.position && (($board.direction === 1 && $board.position.y === -1)))}
    function create_if_block_5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "marble svelte-11rckbw");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marble" + /*$board*/ ctx[4].marble.color + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 149, 8, 5048);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			/*img_binding*/ ctx[24](img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$basePath, $board*/ 144 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marble" + /*$board*/ ctx[4].marble.color + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			/*img_binding*/ ctx[24](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(149:6) {#if ($board.marble && $board.position && (($board.direction === 1 && $board.position.y === -1)))}",
    		ctx
    	});

    	return block;
    }

    // (154:6) {#if ($board.marble && $board.position && (($board.direction === -1 && $board.position.y === -1)))}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "marble svelte-11rckbw");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marble" + /*$board*/ ctx[4].marble.color + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 154, 8, 5334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			/*img_binding_1*/ ctx[25](img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$basePath, $board*/ 144 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marble" + /*$board*/ ctx[4].marble.color + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			/*img_binding_1*/ ctx[25](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(154:6) {#if ($board.marble && $board.position && (($board.direction === -1 && $board.position.y === -1)))}",
    		ctx
    	});

    	return block;
    }

    // (183:8) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "position blank svelte-11rckbw");
    			add_location(div, file$3, 183, 10, 6712);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(183:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (163:8) {#if $board.isValid(x, y)}
    function create_if_block$3(ctx) {
    	let div;
    	let show_if;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*part*/ ctx[38]) return create_if_block_1;
    		if (show_if == null || dirty[0] & /*$board*/ 16) show_if = !!/*hasMarble*/ ctx[9](/*x*/ ctx[40], /*y*/ ctx[37]);
    		if (show_if) return create_if_block_3;
    	}

    	let current_block_type = select_block_type_1(ctx, [-1]);
    	let if_block = current_block_type && current_block_type(ctx);

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[28](/*x*/ ctx[40], /*y*/ ctx[37], ...args);
    	}

    	function touchstart_handler(...args) {
    		return /*touchstart_handler*/ ctx[29](/*x*/ ctx[40], /*y*/ ctx[37], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "position svelte-11rckbw");
    			toggle_class(div, "occupied", /*part*/ ctx[38] && !/*part*/ ctx[38].locked);
    			toggle_class(div, "empty", !/*part*/ ctx[38]);
    			toggle_class(div, "slot", /*$board*/ ctx[4].hasSlot(/*x*/ ctx[40], /*y*/ ctx[37]));
    			add_location(div, file$3, 163, 8, 5651);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    				listen_dev(div, "touchstart", touchstart_handler, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty[0] & /*$board*/ 16) {
    				toggle_class(div, "occupied", /*part*/ ctx[38] && !/*part*/ ctx[38].locked);
    			}

    			if (dirty[0] & /*$board*/ 16) {
    				toggle_class(div, "empty", !/*part*/ ctx[38]);
    			}

    			if (dirty[0] & /*$board*/ 16) {
    				toggle_class(div, "slot", /*$board*/ ctx[4].hasSlot(/*x*/ ctx[40], /*y*/ ctx[37]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (if_block) {
    				if_block.d();
    			}

    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(163:8) {#if $board.isValid(x, y)}",
    		ctx
    	});

    	return block;
    }

    // (178:36) 
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "marble svelte-11rckbw");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marble" + /*$board*/ ctx[4].marble.color + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			toggle_class(img, "right", !Math.floor((/*$board*/ ctx[4].direction + 1) / 2));
    			add_location(img, file$3, 178, 12, 6476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			/*img_binding_3*/ ctx[27](img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$basePath, $board*/ 144 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marble" + /*$board*/ ctx[4].marble.color + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*$board*/ 16) {
    				toggle_class(img, "right", !Math.floor((/*$board*/ ctx[4].direction + 1) / 2));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			/*img_binding_3*/ ctx[27](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(178:36) ",
    		ctx
    	});

    	return block;
    }

    // (168:10) {#if part}
    function create_if_block_1(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;
    	let show_if = /*hasMarble*/ ctx[9](/*x*/ ctx[40], /*y*/ ctx[37]);
    	let div1_class_value;
    	let if_block = show_if && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(img, "class", "part svelte-11rckbw");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/" + /*part*/ ctx[38].name + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*part*/ ctx[38].name);
    			toggle_class(img, "locked", /*part*/ ctx[38].locked);
    			add_location(img, file$3, 171, 14, 6107);
    			attr_dev(div0, "class", "wrapper svelte-11rckbw");
    			toggle_class(div0, "down", /*isMoving*/ ctx[10](/*x*/ ctx[40], /*y*/ ctx[37]));
    			toggle_class(div0, "reset", /*reset*/ ctx[2]);
    			add_location(div0, file$3, 169, 12, 6013);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*part*/ ctx[38].name) + " svelte-11rckbw"));
    			toggle_class(div1, "flipped", /*part*/ ctx[38].facing);
    			toggle_class(div1, "right", /*marbleDirection*/ ctx[11](/*x*/ ctx[40], /*y*/ ctx[37]));
    			add_location(div1, file$3, 168, 10, 5910);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$basePath, $board*/ 144 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/" + /*part*/ ctx[38].name + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*$board*/ 16 && img_alt_value !== (img_alt_value = /*part*/ ctx[38].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty[0] & /*$board*/ 16) {
    				toggle_class(img, "locked", /*part*/ ctx[38].locked);
    			}

    			if (dirty[0] & /*$board*/ 16) show_if = /*hasMarble*/ ctx[9](/*x*/ ctx[40], /*y*/ ctx[37]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*isMoving, $board*/ 1040) {
    				toggle_class(div0, "down", /*isMoving*/ ctx[10](/*x*/ ctx[40], /*y*/ ctx[37]));
    			}

    			if (dirty[0] & /*reset*/ 4) {
    				toggle_class(div0, "reset", /*reset*/ ctx[2]);
    			}

    			if (dirty[0] & /*$board*/ 16 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*part*/ ctx[38].name) + " svelte-11rckbw"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty[0] & /*$board, $board*/ 16) {
    				toggle_class(div1, "flipped", /*part*/ ctx[38].facing);
    			}

    			if (dirty[0] & /*$board, marbleDirection, $board*/ 2064) {
    				toggle_class(div1, "right", /*marbleDirection*/ ctx[11](/*x*/ ctx[40], /*y*/ ctx[37]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(168:10) {#if part}",
    		ctx
    	});

    	return block;
    }

    // (173:14) {#if hasMarble(x, y)}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "marble svelte-11rckbw");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marble" + /*$board*/ ctx[4].marble.color + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 173, 16, 6261);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			/*img_binding_2*/ ctx[26](img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$basePath, $board*/ 144 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marble" + /*$board*/ ctx[4].marble.color + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			/*img_binding_2*/ ctx[26](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(173:14) {#if hasMarble(x, y)}",
    		ctx
    	});

    	return block;
    }

    // (162:6) {#each row as part, x (x)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*$board*/ 16) show_if = !!/*$board*/ ctx[4].isValid(/*x*/ ctx[40], /*y*/ ctx[37]);
    		if (show_if) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx, [-1]);
    	let if_block = current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(162:6) {#each row as part, x (x)}",
    		ctx
    	});

    	return block;
    }

    // (160:4) {#each $board as row, y (y)}
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let each_value_1 = /*row*/ ctx[35];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*x*/ ctx[40];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "row svelte-11rckbw");
    			add_location(div, file$3, 160, 4, 5557);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$board, grab, marbleDirection, isMoving, reset, $basePath, marbleElement, hasMarble*/ 3990) {
    				const each_value_1 = /*row*/ ctx[35];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1, t, get_each_context_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(160:4) {#each $board as row, y (y)}",
    		ctx
    	});

    	return block;
    }

    // (202:0) <NumbersModal bind:visible={$marbles.edit.left} title="Number of Blue Marbles"     number={$marbles.numbers.left} infinity={false} max=20     on:update="{(e) => updateMarbleNumbers('left', e.detail)}">
    function create_default_slot_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "modal-image svelte-11rckbw");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marbleblue.svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Blue Marble");
    			add_location(img, file$3, 204, 2, 7606);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$basePath*/ 128 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marbleblue.svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(202:0) <NumbersModal bind:visible={$marbles.edit.left} title=\\\"Number of Blue Marbles\\\"     number={$marbles.numbers.left} infinity={false} max=20     on:update=\\\"{(e) => updateMarbleNumbers('left', e.detail)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (208:0) <NumbersModal bind:visible={$marbles.edit.right} title="Number of Red Marbles"     number={$marbles.numbers.right} infinity={false} max=20     on:update="{(e) => updateMarbleNumbers('right', e.detail)}">
    function create_default_slot$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "modal-image svelte-11rckbw");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marblered.svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Red Marble");
    			add_location(img, file$3, 210, 2, 7912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$basePath*/ 128 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[7] + "images/marblered.svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(208:0) <NumbersModal bind:visible={$marbles.edit.right} title=\\\"Number of Red Marbles\\\"     number={$marbles.numbers.right} infinity={false} max=20     on:update=\\\"{(e) => updateMarbleNumbers('right', e.detail)}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div11;
    	let div4;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let img0_alt_value;
    	let t0;
    	let t1_value = /*$marbles*/ ctx[5].numbers.left + "";
    	let t1;
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let img1_alt_value;
    	let t4;
    	let t5_value = /*$marbles*/ ctx[5].numbers.right + "";
    	let t5;
    	let t6;
    	let t7;
    	let div7;
    	let div5;
    	let t8;
    	let div6;
    	let t9;
    	let div8;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t10;
    	let div9;
    	let button0;
    	let t11;
    	let button0_disabled_value;
    	let t12;
    	let button1;
    	let t13;
    	let button1_disabled_value;
    	let t14;
    	let div10;
    	let t15;
    	let button2;
    	let t16;
    	let button2_disabled_value;
    	let t17;
    	let updating_visible;
    	let t18;
    	let updating_visible_1;
    	let current;
    	let dispose;

    	const marbletray0 = new MarbleTray({
    			props: { marbles: /*$marbles*/ ctx[5].left },
    			$$inline: true
    		});

    	const marbletray1 = new MarbleTray({
    			props: {
    				direction: "right",
    				marbles: /*$marbles*/ ctx[5].right
    			},
    			$$inline: true
    		});

    	let if_block0 = /*$board*/ ctx[4].marble && /*$board*/ ctx[4].position && (/*$board*/ ctx[4].direction === 1 && /*$board*/ ctx[4].position.y === -1) && create_if_block_5(ctx);
    	let if_block1 = /*$board*/ ctx[4].marble && /*$board*/ ctx[4].position && (/*$board*/ ctx[4].direction === -1 && /*$board*/ ctx[4].position.y === -1) && create_if_block_4(ctx);
    	let each_value = /*$board*/ ctx[4];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*y*/ ctx[37];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const marbletray2 = new MarbleTray({
    			props: {
    				result: true,
    				direction: "right",
    				marbles: /*$marbles*/ ctx[5].results
    			},
    			$$inline: true
    		});

    	function numbersmodal0_visible_binding(value) {
    		/*numbersmodal0_visible_binding*/ ctx[31].call(null, value);
    	}

    	let numbersmodal0_props = {
    		title: "Number of Blue Marbles",
    		number: /*$marbles*/ ctx[5].numbers.left,
    		infinity: false,
    		max: "20",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*$marbles*/ ctx[5].edit.left !== void 0) {
    		numbersmodal0_props.visible = /*$marbles*/ ctx[5].edit.left;
    	}

    	const numbersmodal0 = new NumbersModal({
    			props: numbersmodal0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numbersmodal0, "visible", numbersmodal0_visible_binding));
    	numbersmodal0.$on("update", /*update_handler*/ ctx[32]);

    	function numbersmodal1_visible_binding(value) {
    		/*numbersmodal1_visible_binding*/ ctx[33].call(null, value);
    	}

    	let numbersmodal1_props = {
    		title: "Number of Red Marbles",
    		number: /*$marbles*/ ctx[5].numbers.right,
    		infinity: false,
    		max: "20",
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*$marbles*/ ctx[5].edit.right !== void 0) {
    		numbersmodal1_props.visible = /*$marbles*/ ctx[5].edit.right;
    	}

    	const numbersmodal1 = new NumbersModal({
    			props: numbersmodal1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numbersmodal1, "visible", numbersmodal1_visible_binding));
    	numbersmodal1.$on("update", /*update_handler_1*/ ctx[34]);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = text("\n        x ");
    			t1 = text(t1_value);
    			t2 = space();
    			create_component(marbletray0.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			img1 = element("img");
    			t4 = text("\n        x ");
    			t5 = text(t5_value);
    			t6 = space();
    			create_component(marbletray1.$$.fragment);
    			t7 = space();
    			div7 = element("div");
    			div5 = element("div");
    			if (if_block0) if_block0.c();
    			t8 = space();
    			div6 = element("div");
    			if (if_block1) if_block1.c();
    			t9 = space();
    			div8 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			div9 = element("div");
    			button0 = element("button");
    			t11 = text("Trigger Left");
    			t12 = space();
    			button1 = element("button");
    			t13 = text("Trigger Right");
    			t14 = space();
    			div10 = element("div");
    			create_component(marbletray2.$$.fragment);
    			t15 = space();
    			button2 = element("button");
    			t16 = text("Reset");
    			t17 = space();
    			create_component(numbersmodal0.$$.fragment);
    			t18 = space();
    			create_component(numbersmodal1.$$.fragment);
    			if (img0.src !== (img0_src_value = "" + (/*$basePath*/ ctx[7] + "images/marbleblue.svg"))) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", img0_alt_value = "" + (/*$marbles*/ ctx[5].numbers.left + " Blue Marbles"));
    			attr_dev(img0, "class", "svelte-11rckbw");
    			add_location(img0, file$3, 133, 8, 4354);
    			attr_dev(div0, "class", "marble-numbers svelte-11rckbw");
    			add_location(div0, file$3, 132, 6, 4272);
    			attr_dev(div1, "class", "container svelte-11rckbw");
    			add_location(div1, file$3, 131, 4, 4242);
    			if (img1.src !== (img1_src_value = "" + (/*$basePath*/ ctx[7] + "images/marblered.svg"))) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", img1_alt_value = "" + (/*$marbles*/ ctx[5].numbers.right + " Red Marbles"));
    			attr_dev(img1, "class", "svelte-11rckbw");
    			add_location(img1, file$3, 140, 8, 4661);
    			attr_dev(div2, "class", "marble-numbers svelte-11rckbw");
    			add_location(div2, file$3, 139, 6, 4578);
    			attr_dev(div3, "class", "container svelte-11rckbw");
    			add_location(div3, file$3, 138, 4, 4548);
    			attr_dev(div4, "id", "top-trays");
    			attr_dev(div4, "class", "svelte-11rckbw");
    			toggle_class(div4, "no-challenge", !/*$currentChallenge*/ ctx[6]);
    			add_location(div4, file$3, 130, 2, 4177);
    			attr_dev(div5, "class", "marble-start svelte-11rckbw");
    			add_location(div5, file$3, 147, 4, 4908);
    			attr_dev(div6, "class", "marble-start flipped svelte-11rckbw");
    			add_location(div6, file$3, 152, 4, 5185);
    			attr_dev(div7, "id", "start-ramps");
    			attr_dev(div7, "class", "svelte-11rckbw");
    			add_location(div7, file$3, 146, 2, 4881);
    			attr_dev(div8, "id", "board");
    			add_location(div8, file$3, 158, 2, 5478);
    			button0.disabled = button0_disabled_value = /*$board*/ ctx[4].marble || /*triggerLock*/ ctx[3] || /*$currentChallenge*/ ctx[6] && /*$currentChallenge*/ ctx[6].trigger !== "left";
    			attr_dev(button0, "class", "svelte-11rckbw");
    			add_location(button0, file$3, 190, 4, 6831);
    			button1.disabled = button1_disabled_value = /*$board*/ ctx[4].marble || /*triggerLock*/ ctx[3] || /*$currentChallenge*/ ctx[6] && /*$currentChallenge*/ ctx[6].trigger !== "right";
    			attr_dev(button1, "class", "svelte-11rckbw");
    			add_location(button1, file$3, 192, 4, 6999);
    			attr_dev(div9, "id", "levers");
    			attr_dev(div9, "class", "svelte-11rckbw");
    			add_location(div9, file$3, 189, 2, 6809);
    			button2.disabled = button2_disabled_value = !/*$board*/ ctx[4].marble && !/*$marbles*/ ctx[5].results.length;
    			attr_dev(button2, "class", "svelte-11rckbw");
    			add_location(button2, file$3, 197, 4, 7282);
    			attr_dev(div10, "id", "results-tray");
    			attr_dev(div10, "class", "svelte-11rckbw");
    			add_location(div10, file$3, 195, 2, 7177);
    			attr_dev(div11, "id", "board-container");
    			attr_dev(div11, "class", "svelte-11rckbw");
    			add_location(div11, file$3, 129, 0, 4148);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div1, t2);
    			mount_component(marbletray0, div1, null);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img1);
    			append_dev(div2, t4);
    			append_dev(div2, t5);
    			append_dev(div3, t6);
    			mount_component(marbletray1, div3, null);
    			append_dev(div11, t7);
    			append_dev(div11, div7);
    			append_dev(div7, div5);
    			if (if_block0) if_block0.m(div5, null);
    			append_dev(div7, t8);
    			append_dev(div7, div6);
    			if (if_block1) if_block1.m(div6, null);
    			append_dev(div11, t9);
    			append_dev(div11, div8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			/*div8_binding*/ ctx[30](div8);
    			append_dev(div11, t10);
    			append_dev(div11, div9);
    			append_dev(div9, button0);
    			append_dev(button0, t11);
    			append_dev(div9, t12);
    			append_dev(div9, button1);
    			append_dev(button1, t13);
    			append_dev(div11, t14);
    			append_dev(div11, div10);
    			mount_component(marbletray2, div10, null);
    			append_dev(div10, t15);
    			append_dev(div10, button2);
    			append_dev(button2, t16);
    			insert_dev(target, t17, anchor);
    			mount_component(numbersmodal0, target, anchor);
    			insert_dev(target, t18, anchor);
    			mount_component(numbersmodal1, target, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div0, "click", /*click_handler*/ ctx[22], false, false, false),
    				listen_dev(div2, "click", /*click_handler_1*/ ctx[23], false, false, false),
    				listen_dev(button0, "click", /*triggerLeft*/ ctx[12], false, false, false),
    				listen_dev(button1, "click", /*triggerRight*/ ctx[13], false, false, false),
    				listen_dev(button2, "click", /*resetMarbles*/ ctx[14], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*$basePath*/ 128 && img0.src !== (img0_src_value = "" + (/*$basePath*/ ctx[7] + "images/marbleblue.svg"))) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (!current || dirty[0] & /*$marbles*/ 32 && img0_alt_value !== (img0_alt_value = "" + (/*$marbles*/ ctx[5].numbers.left + " Blue Marbles"))) {
    				attr_dev(img0, "alt", img0_alt_value);
    			}

    			if ((!current || dirty[0] & /*$marbles*/ 32) && t1_value !== (t1_value = /*$marbles*/ ctx[5].numbers.left + "")) set_data_dev(t1, t1_value);
    			const marbletray0_changes = {};
    			if (dirty[0] & /*$marbles*/ 32) marbletray0_changes.marbles = /*$marbles*/ ctx[5].left;
    			marbletray0.$set(marbletray0_changes);

    			if (!current || dirty[0] & /*$basePath*/ 128 && img1.src !== (img1_src_value = "" + (/*$basePath*/ ctx[7] + "images/marblered.svg"))) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (!current || dirty[0] & /*$marbles*/ 32 && img1_alt_value !== (img1_alt_value = "" + (/*$marbles*/ ctx[5].numbers.right + " Red Marbles"))) {
    				attr_dev(img1, "alt", img1_alt_value);
    			}

    			if ((!current || dirty[0] & /*$marbles*/ 32) && t5_value !== (t5_value = /*$marbles*/ ctx[5].numbers.right + "")) set_data_dev(t5, t5_value);
    			const marbletray1_changes = {};
    			if (dirty[0] & /*$marbles*/ 32) marbletray1_changes.marbles = /*$marbles*/ ctx[5].right;
    			marbletray1.$set(marbletray1_changes);

    			if (dirty[0] & /*$currentChallenge*/ 64) {
    				toggle_class(div4, "no-challenge", !/*$currentChallenge*/ ctx[6]);
    			}

    			if (/*$board*/ ctx[4].marble && /*$board*/ ctx[4].position && (/*$board*/ ctx[4].direction === 1 && /*$board*/ ctx[4].position.y === -1)) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div5, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$board*/ ctx[4].marble && /*$board*/ ctx[4].position && (/*$board*/ ctx[4].direction === -1 && /*$board*/ ctx[4].position.y === -1)) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div6, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*$board, grab, marbleDirection, isMoving, reset, $basePath, marbleElement, hasMarble*/ 3990) {
    				const each_value = /*$board*/ ctx[4];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div8, destroy_block, create_each_block$1, null, get_each_context$1);
    			}

    			if (!current || dirty[0] & /*$board, triggerLock, $currentChallenge*/ 88 && button0_disabled_value !== (button0_disabled_value = /*$board*/ ctx[4].marble || /*triggerLock*/ ctx[3] || /*$currentChallenge*/ ctx[6] && /*$currentChallenge*/ ctx[6].trigger !== "left")) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (!current || dirty[0] & /*$board, triggerLock, $currentChallenge*/ 88 && button1_disabled_value !== (button1_disabled_value = /*$board*/ ctx[4].marble || /*triggerLock*/ ctx[3] || /*$currentChallenge*/ ctx[6] && /*$currentChallenge*/ ctx[6].trigger !== "right")) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			const marbletray2_changes = {};
    			if (dirty[0] & /*$marbles*/ 32) marbletray2_changes.marbles = /*$marbles*/ ctx[5].results;
    			marbletray2.$set(marbletray2_changes);

    			if (!current || dirty[0] & /*$board, $marbles*/ 48 && button2_disabled_value !== (button2_disabled_value = !/*$board*/ ctx[4].marble && !/*$marbles*/ ctx[5].results.length)) {
    				prop_dev(button2, "disabled", button2_disabled_value);
    			}

    			const numbersmodal0_changes = {};
    			if (dirty[0] & /*$marbles*/ 32) numbersmodal0_changes.number = /*$marbles*/ ctx[5].numbers.left;

    			if (dirty[0] & /*$basePath*/ 128 | dirty[1] & /*$$scope*/ 1024) {
    				numbersmodal0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty[0] & /*$marbles*/ 32) {
    				updating_visible = true;
    				numbersmodal0_changes.visible = /*$marbles*/ ctx[5].edit.left;
    				add_flush_callback(() => updating_visible = false);
    			}

    			numbersmodal0.$set(numbersmodal0_changes);
    			const numbersmodal1_changes = {};
    			if (dirty[0] & /*$marbles*/ 32) numbersmodal1_changes.number = /*$marbles*/ ctx[5].numbers.right;

    			if (dirty[0] & /*$basePath*/ 128 | dirty[1] & /*$$scope*/ 1024) {
    				numbersmodal1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_1 && dirty[0] & /*$marbles*/ 32) {
    				updating_visible_1 = true;
    				numbersmodal1_changes.visible = /*$marbles*/ ctx[5].edit.right;
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			numbersmodal1.$set(numbersmodal1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(marbletray0.$$.fragment, local);
    			transition_in(marbletray1.$$.fragment, local);
    			transition_in(marbletray2.$$.fragment, local);
    			transition_in(numbersmodal0.$$.fragment, local);
    			transition_in(numbersmodal1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(marbletray0.$$.fragment, local);
    			transition_out(marbletray1.$$.fragment, local);
    			transition_out(marbletray2.$$.fragment, local);
    			transition_out(numbersmodal0.$$.fragment, local);
    			transition_out(numbersmodal1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			destroy_component(marbletray0);
    			destroy_component(marbletray1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div8_binding*/ ctx[30](null);
    			destroy_component(marbletray2);
    			if (detaching) detach_dev(t17);
    			destroy_component(numbersmodal0, detaching);
    			if (detaching) detach_dev(t18);
    			destroy_component(numbersmodal1, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $socket;
    	let $holding;
    	let $board;
    	let $marbles;
    	let $currentChallenge;
    	let $basePath;
    	validate_store(socket$2, "socket");
    	component_subscribe($$self, socket$2, $$value => $$invalidate(18, $socket = $$value));
    	validate_store(holding, "holding");
    	component_subscribe($$self, holding, $$value => $$invalidate(19, $holding = $$value));
    	validate_store(board, "board");
    	component_subscribe($$self, board, $$value => $$invalidate(4, $board = $$value));
    	validate_store(marbles, "marbles");
    	component_subscribe($$self, marbles, $$value => $$invalidate(5, $marbles = $$value));
    	validate_store(currentChallenge, "currentChallenge");
    	component_subscribe($$self, currentChallenge, $$value => $$invalidate(6, $currentChallenge = $$value));
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, $$value => $$invalidate(7, $basePath = $$value));
    	let { lastGrab } = $$props;
    	let { boardElement } = $$props;
    	const dispatch = createEventDispatcher();

    	function grab(e, x, y) {
    		if ((e.type === "mousedown" && e.button === 0 || e.type === "touchstart" && e.touches.length === 1) && !$holding && !$board.marble && $board[y][x]) {
    			e.preventDefault();
    			e.stopPropagation();
    			if (e.type === "touchstart") dispatch("touch", e);

    			if (!$board[y][x].locked) {
    				console.log(`Grabbed ${$board[y][x].name}`);
    				set_store_value(holding, $holding = $board[y][x]);
    				set_store_value(board, $board[y][x] = false, $board);

    				$$invalidate(17, lastGrab = {
    					x,
    					y,
    					timeout: setTimeout(() => $$invalidate(17, lastGrab = { x: false, y: false, timeout: false }), 300)
    				});

    				socket$2.sendBoard();
    			} else if ($board[y][x].flipsOnMarble) {
    				$board.flip(x, y);
    				board.set($board);
    				console.log(`Flipped ${$board[y][x].name}`);
    				socket$2.sendBoard();
    			}
    		}
    	}

    	let marbleElement;
    	let reset = false;
    	let triggerLock = false;

    	function triggerLever(side = "left") {
    		if (!$board.marble && $marbles[side].length) {
    			$board.startRun($marbles[side].pop(), side, async () => {
    				// Starts a marble run, waits for the marble to animate through current part before advancing it through the board.
    				board.set($board);

    				$$invalidate(2, reset = true); // Applies reset class to clear transition based animations.
    				await tick();
    				setTimeout(() => $$invalidate(2, reset = false), 1);

    				return new Promise(resolve => {
    						marbleElement.addEventListener("animationend", resolve, { once: true });
    						marbleElement.addEventListener("oTransitionEnd", resolve, { once: true });
    						marbleElement.addEventListener("webkitTransitionEnd", resolve, { once: true });
    					});
    			}).then(result => {
    				if (result) {
    					// Adds the marble to the results and atempts to launch another one from the coresponding side.
    					$marbles.results.push(result.marble);

    					board.set($board);
    					triggerLever(result.side);
    					marbles.set($marbles);
    				}
    			}).catch(() => {
    				// If anything goes wrong, reset the board.
    				// Need to add better feedback for dropped marbles.
    				if ($marbles.results.length === 0) {
    					marbles.reset();
    					$$invalidate(3, triggerLock = false);
    				} else {
    					set_store_value(board, $board.marble = false, $board);
    					$$invalidate(3, triggerLock = true);
    				}
    			});

    			marbles.set($marbles);
    		}
    	}

    	function hasMarble(x, y) {
    		return $board.marble && $board.position && (x === $board.position.x && y === $board.position.y);
    	}

    	function isMoving(x, y) {
    		// Determines if the part at x,y should be animating.
    		return hasMarble(x, y) && $board.at(x, y).name != "gear" || $board.position && !hasMarble(x, y) && $board.flipableNeighbors($board.position.x, $board.position.y).has($board.at(x, y));
    	}

    	function marbleDirection(x, y) {
    		return hasMarble(x, y) && Math.floor(($board.direction + 1) / 2) === $board.at(x, y).facing;
    	}

    	function triggerLeft() {
    		if ($socket) $socket.emit("run", "left");
    		triggerLever("left");
    	}

    	function triggerRight() {
    		if ($socket) $socket.emit("run", "right");
    		triggerLever("right");
    	}

    	function resetMarbles() {
    		marbles.reset();
    		$$invalidate(3, triggerLock = false);
    		socket$2.sendBoard();
    	}

    	function editMarbleNumbers(side) {
    		set_store_value(marbles, $marbles.edit[side] = !$currentChallenge, $marbles);
    		marbles.set($marbles);
    	}

    	function updateMarbleNumbers(side, number) {
    		const oldNumber = $marbles.numbers[side];
    		set_store_value(marbles, $marbles.numbers[side] = number, $marbles);
    		marbles.set($marbles);
    		if (oldNumber != $marbles.numbers[side]) resetMarbles();
    	}

    	const writable_props = ["lastGrab", "boardElement"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<GameBoard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GameBoard", $$slots, []);
    	const click_handler = () => editMarbleNumbers("left");
    	const click_handler_1 = () => editMarbleNumbers("right");

    	function img_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, marbleElement = $$value);
    		});
    	}

    	function img_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, marbleElement = $$value);
    		});
    	}

    	function img_binding_2($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, marbleElement = $$value);
    		});
    	}

    	function img_binding_3($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, marbleElement = $$value);
    		});
    	}

    	const mousedown_handler = (x, y, e) => grab(e, x, y);
    	const touchstart_handler = (x, y, e) => grab(e, x, y);

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, boardElement = $$value);
    		});
    	}

    	function numbersmodal0_visible_binding(value) {
    		$marbles.edit.left = value;
    		marbles.set($marbles);
    	}

    	const update_handler = e => updateMarbleNumbers("left", e.detail);

    	function numbersmodal1_visible_binding(value) {
    		$marbles.edit.right = value;
    		marbles.set($marbles);
    	}

    	const update_handler_1 = e => updateMarbleNumbers("right", e.detail);

    	$$self.$set = $$props => {
    		if ("lastGrab" in $$props) $$invalidate(17, lastGrab = $$props.lastGrab);
    		if ("boardElement" in $$props) $$invalidate(0, boardElement = $$props.boardElement);
    	};

    	$$self.$capture_state = () => ({
    		MarbleTray,
    		NumbersModal,
    		tick,
    		createEventDispatcher,
    		holding,
    		currentChallenge,
    		board,
    		marbles,
    		socket: socket$2,
    		basePath,
    		lastGrab,
    		boardElement,
    		dispatch,
    		grab,
    		marbleElement,
    		reset,
    		triggerLock,
    		triggerLever,
    		hasMarble,
    		isMoving,
    		marbleDirection,
    		triggerLeft,
    		triggerRight,
    		resetMarbles,
    		editMarbleNumbers,
    		updateMarbleNumbers,
    		$socket,
    		$holding,
    		$board,
    		$marbles,
    		$currentChallenge,
    		$basePath
    	});

    	$$self.$inject_state = $$props => {
    		if ("lastGrab" in $$props) $$invalidate(17, lastGrab = $$props.lastGrab);
    		if ("boardElement" in $$props) $$invalidate(0, boardElement = $$props.boardElement);
    		if ("marbleElement" in $$props) $$invalidate(1, marbleElement = $$props.marbleElement);
    		if ("reset" in $$props) $$invalidate(2, reset = $$props.reset);
    		if ("triggerLock" in $$props) $$invalidate(3, triggerLock = $$props.triggerLock);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$socket*/ 262144) {
    			 if ($socket) $socket.on("run", side => {
    				triggerLever(side);
    				console.log("run");
    			});
    		}
    	};

    	return [
    		boardElement,
    		marbleElement,
    		reset,
    		triggerLock,
    		$board,
    		$marbles,
    		$currentChallenge,
    		$basePath,
    		grab,
    		hasMarble,
    		isMoving,
    		marbleDirection,
    		triggerLeft,
    		triggerRight,
    		resetMarbles,
    		editMarbleNumbers,
    		updateMarbleNumbers,
    		lastGrab,
    		$socket,
    		$holding,
    		dispatch,
    		triggerLever,
    		click_handler,
    		click_handler_1,
    		img_binding,
    		img_binding_1,
    		img_binding_2,
    		img_binding_3,
    		mousedown_handler,
    		touchstart_handler,
    		div8_binding,
    		numbersmodal0_visible_binding,
    		update_handler,
    		numbersmodal1_visible_binding,
    		update_handler_1
    	];
    }

    class GameBoard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { lastGrab: 17, boardElement: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameBoard",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*lastGrab*/ ctx[17] === undefined && !("lastGrab" in props)) {
    			console_1.warn("<GameBoard> was created without expected prop 'lastGrab'");
    		}

    		if (/*boardElement*/ ctx[0] === undefined && !("boardElement" in props)) {
    			console_1.warn("<GameBoard> was created without expected prop 'boardElement'");
    		}
    	}

    	get lastGrab() {
    		throw new Error("<GameBoard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lastGrab(value) {
    		throw new Error("<GameBoard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get boardElement() {
    		throw new Error("<GameBoard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set boardElement(value) {
    		throw new Error("<GameBoard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte/PartsTray.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$4 = "src/svelte/PartsTray.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[15] = list;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (60:6) {:else}
    function create_else_block$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "∞";
    			attr_dev(span, "class", "infinity svelte-hegwk3");
    			add_location(span, file$4, 60, 8, 2124);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(60:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (58:6) {#if part.count != Infinity}
    function create_if_block$4(ctx) {
    	let t_value = /*part*/ ctx[14].count + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$parts*/ 1 && t_value !== (t_value = /*part*/ ctx[14].count + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(58:6) {#if part.count != Infinity}",
    		ctx
    	});

    	return block;
    }

    // (65:2) <NumbersModal bind:visible="{part.editing}" title="Number of {part.name}s"     number={part.count} on:update="{(e) => updatePartNumbers(part, e.detail)}">
    function create_default_slot$2(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "modal-image svelte-hegwk3");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[1] + "images/" + /*part*/ ctx[14].name + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*part*/ ctx[14].name);
    			add_location(img, file$4, 66, 4, 2356);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath, $parts*/ 3 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[1] + "images/" + /*part*/ ctx[14].name + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$parts*/ 1 && img_alt_value !== (img_alt_value = /*part*/ ctx[14].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(65:2) <NumbersModal bind:visible=\\\"{part.editing}\\\" title=\\\"Number of {part.name}s\\\"     number={part.count} on:update=\\\"{(e) => updatePartNumbers(part, e.detail)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (50:2) {#each $parts as part}
    function create_each_block$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let span;
    	let t1;
    	let t2;
    	let updating_visible;
    	let current;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*part*/ ctx[14].count != Infinity) return create_if_block$4;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[8](/*part*/ ctx[14], ...args);
    	}

    	function touchstart_handler(...args) {
    		return /*touchstart_handler*/ ctx[9](/*part*/ ctx[14], ...args);
    	}

    	function mouseup_handler(...args) {
    		return /*mouseup_handler*/ ctx[10](/*part*/ ctx[14], ...args);
    	}

    	function touchend_handler(...args) {
    		return /*touchend_handler*/ ctx[11](/*part*/ ctx[14], ...args);
    	}

    	function numbersmodal_visible_binding(value) {
    		/*numbersmodal_visible_binding*/ ctx[12].call(null, value, /*part*/ ctx[14]);
    	}

    	function update_handler(...args) {
    		return /*update_handler*/ ctx[13](/*part*/ ctx[14], ...args);
    	}

    	let numbersmodal_props = {
    		title: "Number of " + /*part*/ ctx[14].name + "s",
    		number: /*part*/ ctx[14].count,
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*part*/ ctx[14].editing !== void 0) {
    		numbersmodal_props.visible = /*part*/ ctx[14].editing;
    	}

    	const numbersmodal = new NumbersModal({
    			props: numbersmodal_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numbersmodal, "visible", numbersmodal_visible_binding));
    	numbersmodal.$on("update", update_handler);

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			t1 = text("x \n      ");
    			if_block.c();
    			t2 = space();
    			create_component(numbersmodal.$$.fragment);
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[1] + "images/" + /*part*/ ctx[14].name + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*part*/ ctx[14].name);
    			attr_dev(img, "class", "svelte-hegwk3");
    			add_location(img, file$4, 55, 4, 1957);
    			attr_dev(span, "class", "count svelte-hegwk3");
    			add_location(span, file$4, 56, 4, 2023);
    			attr_dev(div, "class", "part svelte-hegwk3");
    			toggle_class(div, "unavailable", !/*part*/ ctx[14].count);
    			add_location(div, file$4, 50, 2, 1736);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			if_block.m(span, null);
    			insert_dev(target, t2, anchor);
    			mount_component(numbersmodal, target, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    				listen_dev(div, "touchstart", touchstart_handler, false, false, false),
    				listen_dev(div, "mouseup", mouseup_handler, false, false, false),
    				listen_dev(div, "touchend", touchend_handler, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*$basePath, $parts*/ 3 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[1] + "images/" + /*part*/ ctx[14].name + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*$parts*/ 1 && img_alt_value !== (img_alt_value = /*part*/ ctx[14].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}

    			if (dirty & /*$parts*/ 1) {
    				toggle_class(div, "unavailable", !/*part*/ ctx[14].count);
    			}

    			const numbersmodal_changes = {};
    			if (dirty & /*$parts*/ 1) numbersmodal_changes.title = "Number of " + /*part*/ ctx[14].name + "s";
    			if (dirty & /*$parts*/ 1) numbersmodal_changes.number = /*part*/ ctx[14].count;

    			if (dirty & /*$$scope, $basePath, $parts*/ 131075) {
    				numbersmodal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*$parts*/ 1) {
    				updating_visible = true;
    				numbersmodal_changes.visible = /*part*/ ctx[14].editing;
    				add_flush_callback(() => updating_visible = false);
    			}

    			numbersmodal.$set(numbersmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numbersmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numbersmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			if (detaching) detach_dev(t2);
    			destroy_component(numbersmodal, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(50:2) {#each $parts as part}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	let each_value = /*$parts*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "parts-tray");
    			attr_dev(div, "class", "svelte-hegwk3");
    			add_location(div, file$4, 48, 0, 1687);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$parts, updatePartNumbers, $basePath, grab, edit, Infinity*/ 31) {
    				each_value = /*$parts*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $holding;
    	let $parts;
    	let $currentChallenge;
    	let $basePath;
    	validate_store(holding, "holding");
    	component_subscribe($$self, holding, $$value => $$invalidate(5, $holding = $$value));
    	validate_store(parts, "parts");
    	component_subscribe($$self, parts, $$value => $$invalidate(0, $parts = $$value));
    	validate_store(currentChallenge, "currentChallenge");
    	component_subscribe($$self, currentChallenge, $$value => $$invalidate(6, $currentChallenge = $$value));
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, $$value => $$invalidate(1, $basePath = $$value));
    	const dispatch = createEventDispatcher();

    	function grab(e, part) {
    		if ((e.type === "mousedown" && e.button === 0 || e.type === "touchstart" && e.touches.length === 1) && !$holding) {
    			e.preventDefault();
    			e.stopPropagation();
    			if (e.type === "touchstart") dispatch("touch", e);

    			if (part.count > 0) {
    				console.log(`Grabbed ${part.name}`);
    				part.count -= 1;
    				set_store_value(holding, $holding = new part());
    			}

    			part.editTimer = setTimeout(() => part.editTimer = false, 600);
    			parts.set($parts);
    		}
    	}

    	function edit(e, part) {
    		if (part.editTimer && (e.type === "mouseup" && e.button === 0 || e.type === "touchend" && e.changedTouches.length === 1 && e.touches.length === 0)) {
    			if (e.type === "touchend") {
    				const targetArea = e.target.getBoundingClientRect();
    				const pageX = e.changedTouches[0].pageX;
    				const pageY = e.changedTouches[0].pageY;
    				if (pageX > targetArea.left + window.scrollX && pageX < targetArea.right + window.scrollX && pageY > targetArea.top + window.scrollY && pageY < targetArea.bottom + window.scrollY) part.editing = !$currentChallenge;
    			} else part.editing = !$currentChallenge;

    			clearTimeout(part.editTimer);
    			part.editTimer = false;
    			parts.set($parts);
    		}
    	}

    	function updatePartNumbers(part, number) {
    		part.count = number;
    		parts.set($parts);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<PartsTray> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PartsTray", $$slots, []);
    	const mousedown_handler = (part, e) => grab(e, part);
    	const touchstart_handler = (part, e) => grab(e, part);
    	const mouseup_handler = (part, e) => edit(e, part);
    	const touchend_handler = (part, e) => edit(e, part);

    	function numbersmodal_visible_binding(value, part) {
    		part.editing = value;
    		parts.set($parts);
    	}

    	const update_handler = (part, e) => updatePartNumbers(part, e.detail);

    	$$self.$capture_state = () => ({
    		NumbersModal,
    		createEventDispatcher,
    		holding,
    		currentChallenge,
    		basePath,
    		parts,
    		dispatch,
    		grab,
    		edit,
    		updatePartNumbers,
    		$holding,
    		$parts,
    		$currentChallenge,
    		$basePath
    	});

    	return [
    		$parts,
    		$basePath,
    		grab,
    		edit,
    		updatePartNumbers,
    		$holding,
    		$currentChallenge,
    		dispatch,
    		mousedown_handler,
    		touchstart_handler,
    		mouseup_handler,
    		touchend_handler,
    		numbersmodal_visible_binding,
    		update_handler
    	];
    }

    class PartsTray extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PartsTray",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/svelte/Hand.svelte generated by Svelte v3.20.1 */
    const file$5 = "src/svelte/Hand.svelte";

    // (7:0) {#if $holding}
    function create_if_block$5(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[2] + "images/" + /*$holding*/ ctx[1].name + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*$holding*/ ctx[1].name);
    			attr_dev(img, "class", "svelte-mtsmwy");
    			toggle_class(img, "flipped", /*$holding*/ ctx[1].facing);
    			add_location(img, file$5, 9, 2, 203);
    			attr_dev(div, "id", "hand");
    			set_style(div, "top", /*mousePosition*/ ctx[0].top + "px");
    			set_style(div, "left", /*mousePosition*/ ctx[0].left + "px");
    			attr_dev(div, "class", "svelte-mtsmwy");
    			add_location(div, file$5, 7, 0, 115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath, $holding*/ 6 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[2] + "images/" + /*$holding*/ ctx[1].name + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$holding*/ 2 && img_alt_value !== (img_alt_value = /*$holding*/ ctx[1].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*$holding*/ 2) {
    				toggle_class(img, "flipped", /*$holding*/ ctx[1].facing);
    			}

    			if (dirty & /*mousePosition*/ 1) {
    				set_style(div, "top", /*mousePosition*/ ctx[0].top + "px");
    			}

    			if (dirty & /*mousePosition*/ 1) {
    				set_style(div, "left", /*mousePosition*/ ctx[0].left + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(7:0) {#if $holding}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*$holding*/ ctx[1] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$holding*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $holding;
    	let $basePath;
    	validate_store(holding, "holding");
    	component_subscribe($$self, holding, $$value => $$invalidate(1, $holding = $$value));
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, $$value => $$invalidate(2, $basePath = $$value));
    	let { mousePosition } = $$props;
    	const writable_props = ["mousePosition"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hand> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hand", $$slots, []);

    	$$self.$set = $$props => {
    		if ("mousePosition" in $$props) $$invalidate(0, mousePosition = $$props.mousePosition);
    	};

    	$$self.$capture_state = () => ({
    		holding,
    		basePath,
    		mousePosition,
    		$holding,
    		$basePath
    	});

    	$$self.$inject_state = $$props => {
    		if ("mousePosition" in $$props) $$invalidate(0, mousePosition = $$props.mousePosition);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mousePosition, $holding, $basePath];
    }

    class Hand extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { mousePosition: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hand",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mousePosition*/ ctx[0] === undefined && !("mousePosition" in props)) {
    			console.warn("<Hand> was created without expected prop 'mousePosition'");
    		}
    	}

    	get mousePosition() {
    		throw new Error("<Hand>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mousePosition(value) {
    		throw new Error("<Hand>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte/PlayArea.svelte generated by Svelte v3.20.1 */

    const { console: console_1$2 } = globals;
    const file$6 = "src/svelte/PlayArea.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let updating_boardElement;
    	let updating_lastGrab;
    	let t0;
    	let t1;
    	let current;
    	let dispose;

    	function gameboard_boardElement_binding(value) {
    		/*gameboard_boardElement_binding*/ ctx[10].call(null, value);
    	}

    	function gameboard_lastGrab_binding(value) {
    		/*gameboard_lastGrab_binding*/ ctx[11].call(null, value);
    	}

    	let gameboard_props = {};

    	if (/*boardElement*/ ctx[2] !== void 0) {
    		gameboard_props.boardElement = /*boardElement*/ ctx[2];
    	}

    	if (/*lastGrab*/ ctx[1] !== void 0) {
    		gameboard_props.lastGrab = /*lastGrab*/ ctx[1];
    	}

    	const gameboard = new GameBoard({ props: gameboard_props, $$inline: true });
    	binding_callbacks.push(() => bind(gameboard, "boardElement", gameboard_boardElement_binding));
    	binding_callbacks.push(() => bind(gameboard, "lastGrab", gameboard_lastGrab_binding));
    	gameboard.$on("touch", /*touch_handler*/ ctx[12]);
    	const partstray = new PartsTray({ $$inline: true });
    	partstray.$on("touch", /*touch_handler_1*/ ctx[13]);

    	const hand = new Hand({
    			props: { mousePosition: /*mousePosition*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(gameboard.$$.fragment);
    			t0 = space();
    			create_component(partstray.$$.fragment);
    			t1 = space();
    			create_component(hand.$$.fragment);
    			attr_dev(div, "id", "play-area");
    			attr_dev(div, "class", "svelte-y9d9qr");
    			toggle_class(div, "grabbed", /*$holding*/ ctx[3]);
    			add_location(div, file$6, 73, 0, 2985);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			mount_component(gameboard, div, null);
    			append_dev(div, t0);
    			mount_component(partstray, div, null);
    			insert_dev(target, t1, anchor);
    			mount_component(hand, target, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div, "mousemove", /*setMousePosition*/ ctx[4], false, false, false),
    				listen_dev(div, "mouseup", /*drop*/ ctx[6], false, false, false),
    				listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[14], false, false, false),
    				listen_dev(div, "touchmove", /*touchMove*/ ctx[5], false, false, false),
    				listen_dev(div, "touchend", /*drop*/ ctx[6], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const gameboard_changes = {};

    			if (!updating_boardElement && dirty & /*boardElement*/ 4) {
    				updating_boardElement = true;
    				gameboard_changes.boardElement = /*boardElement*/ ctx[2];
    				add_flush_callback(() => updating_boardElement = false);
    			}

    			if (!updating_lastGrab && dirty & /*lastGrab*/ 2) {
    				updating_lastGrab = true;
    				gameboard_changes.lastGrab = /*lastGrab*/ ctx[1];
    				add_flush_callback(() => updating_lastGrab = false);
    			}

    			gameboard.$set(gameboard_changes);

    			if (dirty & /*$holding*/ 8) {
    				toggle_class(div, "grabbed", /*$holding*/ ctx[3]);
    			}

    			const hand_changes = {};
    			if (dirty & /*mousePosition*/ 1) hand_changes.mousePosition = /*mousePosition*/ ctx[0];
    			hand.$set(hand_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameboard.$$.fragment, local);
    			transition_in(partstray.$$.fragment, local);
    			transition_in(hand.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameboard.$$.fragment, local);
    			transition_out(partstray.$$.fragment, local);
    			transition_out(hand.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(gameboard);
    			destroy_component(partstray);
    			if (detaching) detach_dev(t1);
    			destroy_component(hand, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $board;
    	let $holding;
    	let $parts;
    	validate_store(board, "board");
    	component_subscribe($$self, board, $$value => $$invalidate(7, $board = $$value));
    	validate_store(holding, "holding");
    	component_subscribe($$self, holding, $$value => $$invalidate(3, $holding = $$value));
    	validate_store(parts, "parts");
    	component_subscribe($$self, parts, $$value => $$invalidate(8, $parts = $$value));
    	let mousePosition = {};
    	let lastGrab = { x: false, y: false, timeout: false };
    	let boardElement;

    	function getBoardPosition(pageX, pageY) {
    		// Returns x,y coordinates based on the position on the board element that the user has selected.
    		let boardRect = boardElement.getBoundingClientRect();

    		let x = Math.floor((pageX - (boardRect.left + window.scrollX)) / (boardRect.width / $board[0].length));
    		let y = Math.floor((pageY - (boardRect.top + window.scrollY)) / (boardRect.height / $board.length));
    		if (pageX > boardRect.left + window.scrollX && pageX < boardRect.right + window.scrollX && pageY > boardRect.top + window.scrollY && pageY < boardRect.bottom + window.scrollY && $board.isValid(x, y)) return [x, y]; else return false;
    	}

    	function setMousePosition(e) {
    		$$invalidate(0, mousePosition.left = e.pageX, mousePosition);
    		$$invalidate(0, mousePosition.top = e.pageY, mousePosition);
    	}

    	function touchMove(e, force = false) {
    		if (e.touches.length === 1 && ($holding || force)) {
    			setMousePosition(e.touches[0]);
    			e.preventDefault();
    			e.stopPropagation();
    		}
    	}

    	function drop(e, force = false) {
    		// Places the currently held part on the board, otherwise returns it to the parts tray.
    		if ($holding && (e.type === "mouseup" && e.button === 0 || e.type === "touchend" && e.changedTouches.length === 1 && e.touches.length === 0 || force)) {
    			let boardPosition;
    			if (e.type === "touchend") boardPosition = getBoardPosition(e.changedTouches[0].pageX, e.changedTouches[0].pageY); else boardPosition = getBoardPosition(e.pageX, e.pageY);

    			if (!$board.marble && boardPosition && (!$holding.requiresSlot || $board.hasSlot(...boardPosition)) && !$board[boardPosition[1]][boardPosition[0]]) {
    				set_store_value(board, $board[boardPosition[1]][boardPosition[0]] = $holding, $board);

    				if (lastGrab.x === boardPosition[0] && lastGrab.y === boardPosition[1]) {
    					$board.flip(...boardPosition);
    					console.log(`Flipped ${$holding.name}`);
    				}

    				console.log(`Placed ${$holding.name}`);
    				let flipableNeighbors = Array.from($board.flipableNeighbors(...boardPosition));
    				if (flipableNeighbors.length > 1) flipableNeighbors.forEach(part => part.facing = flipableNeighbors[1].facing);
    			} else {
    				$parts.find(part => part.name === $holding.name).count++;
    				parts.set($parts);
    				console.log(`Dropped ${$holding.name}`);
    			}

    			if (lastGrab.timeout) window.clearTimeout(lastGrab.timeout);
    			set_store_value(holding, $holding = false);
    			board.set($board);
    			socket$2.sendBoard();
    			e.preventDefault();
    			e.stopPropagation();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<PlayArea> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PlayArea", $$slots, []);

    	function gameboard_boardElement_binding(value) {
    		boardElement = value;
    		$$invalidate(2, boardElement);
    	}

    	function gameboard_lastGrab_binding(value) {
    		lastGrab = value;
    		$$invalidate(1, lastGrab);
    	}

    	const touch_handler = e => touchMove(e.detail);
    	const touch_handler_1 = e => touchMove(e.detail, true);
    	const mouseleave_handler = e => drop(e, true);

    	$$self.$capture_state = () => ({
    		GameBoard,
    		PartsTray,
    		Hand,
    		holding,
    		board,
    		marbles,
    		parts,
    		socket: socket$2,
    		mousePosition,
    		lastGrab,
    		boardElement,
    		getBoardPosition,
    		setMousePosition,
    		touchMove,
    		drop,
    		$board,
    		$holding,
    		$parts
    	});

    	$$self.$inject_state = $$props => {
    		if ("mousePosition" in $$props) $$invalidate(0, mousePosition = $$props.mousePosition);
    		if ("lastGrab" in $$props) $$invalidate(1, lastGrab = $$props.lastGrab);
    		if ("boardElement" in $$props) $$invalidate(2, boardElement = $$props.boardElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		mousePosition,
    		lastGrab,
    		boardElement,
    		$holding,
    		setMousePosition,
    		touchMove,
    		drop,
    		$board,
    		$parts,
    		getBoardPosition,
    		gameboard_boardElement_binding,
    		gameboard_lastGrab_binding,
    		touch_handler,
    		touch_handler_1,
    		mouseleave_handler
    	];
    }

    class PlayArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayArea",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/svelte/ShareURL.svelte generated by Svelte v3.20.1 */
    const file$7 = "src/svelte/ShareURL.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let button;
    	let t;
    	let textarea;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			if (default_slot) default_slot.c();
    			t = space();
    			textarea = element("textarea");
    			attr_dev(button, "class", "svelte-12x1fg9");
    			add_location(button, file$7, 25, 2, 471);
    			attr_dev(textarea, "name", "url");
    			attr_dev(textarea, "class", "copy-text svelte-12x1fg9");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			add_location(textarea, file$7, 26, 2, 531);
    			attr_dev(div, "class", "copy-url");
    			add_location(div, file$7, 24, 0, 446);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			append_dev(div, t);
    			append_dev(div, textarea);
    			/*textarea_binding*/ ctx[6](textarea);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*copyToClipboard*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*textarea_binding*/ ctx[6](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { textFunction = () => "" } = $$props;
    	const dispatch = createEventDispatcher();
    	let copyText;

    	function copyToClipboard() {
    		$$invalidate(0, copyText.value = textFunction(), copyText);
    		$$invalidate(0, copyText.style.display = "inline-block", copyText);
    		copyText.select();
    		copyText.setSelectionRange(0, 99999);
    		document.execCommand("copy");
    		$$invalidate(0, copyText.style.display = "", copyText);
    		dispatch("close");
    	}

    	const writable_props = ["textFunction"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ShareURL> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ShareURL", $$slots, ['default']);

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, copyText = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("textFunction" in $$props) $$invalidate(2, textFunction = $$props.textFunction);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		textFunction,
    		dispatch,
    		copyText,
    		copyToClipboard
    	});

    	$$self.$inject_state = $$props => {
    		if ("textFunction" in $$props) $$invalidate(2, textFunction = $$props.textFunction);
    		if ("copyText" in $$props) $$invalidate(0, copyText = $$props.copyText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		copyText,
    		copyToClipboard,
    		textFunction,
    		dispatch,
    		$$scope,
    		$$slots,
    		textarea_binding
    	];
    }

    class ShareURL extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { textFunction: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShareURL",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get textFunction() {
    		throw new Error("<ShareURL>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textFunction(value) {
    		throw new Error("<ShareURL>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var challenges = [{
      id: 1,
      name: 'Gravity',
      code: '-C1GD0FC1GKC1GKC1GKC1GKK_IA0E2A4A6A7A8A',
      trigger: 'left',
      output: 'bbbbbbbb',
      objective: 'Make all of the blue balls (and only the blue balls) reach the end.'
    }, {
      id: 2,
      name: 'Re-entry',
      code: '-C1GD1FE1EF1DG1CH1BKKKKK_II0F2A6A7A4A8A',
      trigger: 'left',
      output: 'bbbbbbbb',
      objective: 'Make all of the blue balls (and only the blue balls) reach the end.'
    }, {
      id: 3,
      name: 'Ignition',
      code: '-C1C0CKKKKKI0AH1BI0AH1BK_II0G2A6A7A4A8A',
      trigger: 'left',
      output: 'rrrrrrrrb',
      objective: 'Release one blue ball and then all of the red balls.'
    }, {
      id: 4,
      name: 'Fusion',
      code: '-C0C1CB0E1BA0G1AKKKKKKKK_II0N2A6A7A4A8A',
      trigger: 'right',
      output: 'bbbbbbbbr',
      objective: 'Release one red ball and then all of the blue balls.'
    }, {
      id: 5,
      name: 'Entropy',
      code: '-C1GD1FE6EF1DG0CF1DG0CF1DG0CF1DK_II0J2A6A7A4A8A',
      trigger: 'left',
      output: 'rbrbrbrbrbrbrbrb',
      objective: 'Make the pattern blue, red, blue, red, blue, red...'
    }, {
      id: 6,
      name: 'Total Internal Reflection',
      code: '-KD1A0DKD1A0DKD1A0DKD1A0DKD1A0DK_II0C2A6F7A4A8A',
      trigger: 'left',
      output: 'rbrbrbrbrbrbrbrb',
      objective: 'Make the pattern blue, red, blue, red, blue, red...'
    }, {
      id: 7,
      name: 'Path of Least Resistance',
      code: '-KKC6A6EKA6ID6FKB6HC6GKK_II0G2A6A7A4A8A',
      trigger: 'left',
      output: 'bbbbbbbb',
      objective: 'Create a path for the blue balls to reach the output with only 6 ramps.'
    }, {
      id: 8,
      name: 'Depolarization',
      code: '-C1C0CD1A0DE2EKKKKKKKK_II0O2A6A7A4A8A',
      trigger: 'left',
      output: 'rbrbrbrbrbrbrbrb',
      objective: 'Make the pattern blue, red, blue, red, blue, red...'
    }, {
      id: 9,
      name: 'Dimers',
      code: '-C2C0CD1A0DE6EKKKKKKKK_KK0S2A6A7A4A8A',
      trigger: 'left',
      output: 'rbbrbbrbbrbbrbb',
      objective: 'Make the pattern blue, blue, red, blue, blue, red...'
    }, {
      id: 10,
      name: 'Double Bond',
      code: '-C2C3CKE6EKKKKKKKK_II0W2A6A7A4A8A',
      trigger: 'left',
      output: 'rrbbrrbbrrbbrrbbrrbbrrbbrrbbrrbb',
      objective: 'Make the pattern blue, blue, red, red, blue, blue, red, red...'
    }, {
      id: 11,
      name: 'Selectivity',
      code: '-KKE2EKKKA3A3A3A3A3AKKKK_CA0P2A6A7A4A8A',
      trigger: 'left',
      objective: 'Flip bits 2 and 5 to the right. See the puzzle book for further details.'
    }, {
      id: 12,
      name: 'Duality',
      code: '-C1GD1FE2EKKKG0CF0DE7EKK_II0D2A6A7A4A8A',
      trigger: 'left',
      objective: 'Intercept a blue ball.'
    }, {
      id: 13,
      name: 'Duality - Part 2',
      code: '-C1GD1FE2EF1DG1CH0BG0CF0DE7EKK_I0M2A6A7A4A8A',
      trigger: 'left',
      objective: 'Intercept a red ball.'
    }, {
      id: 14,
      name: 'Duality - Part 3',
      code: '-KKE2EKKKKKE7EKK_II0U2A6A7A4A8A',
      trigger: 'left',
      objective: 'If the machine starts with bit A pointing to the left, intercept a blue ball. Otherwise, intercept a red ball. See the puzzle book for further details.'
    }, {
      id: 15,
      name: 'Inversion',
      code: '-C2C0CD1A0DE7EKKKKKE2EKK_II0L2A6C7A4A8A',
      trigger: 'left',
      objective: ' If bit A starts to the left, intercept a blue ball. If bit A starts to the right, intercept a red ball. See the puzzle book for further details.'
    }, {
      id: 16,
      name: 'Termination',
      code: '-C3GB1HC3GB7HKKKKKKK_II0K2A6A7A4A8A',
      trigger: 'left',
      output: 'bbb',
      objective: 'Let only 3 blue balls reach the bottom and catch the 4th ball in the interceptor.'
    }, {
      id: 17,
      name: 'Fixed Ratio',
      code: '-C3C3CD0A1DC2C3CF7DKKKKKKK_II2A6A7A4A8A',
      trigger: 'left',
      output: 'rrrbbb',
      objective: 'Make the pattern blue, blue, blue, red, red, red.'
    }, {
      id: 18,
      name: 'Entanglement',
      code: '-KKE2EKE2EKC7C7CKKKK_II0H2A6A7A4A8A',
      trigger: 'left',
      objective: ' If the top bit AND the bottom bit start pointed to the right, put a ball in interceptor T. Otherwise put a ball in interceptor F. See the puzzle book for further details.'
    }, {
      id: 19,
      name: 'Entanglement',
      code: '-KKE2EKE2EKKKKKE7E_II2A6C7A4A8A',
      trigger: 'left',
      objective: 'If the top bit AND the bottom bit start pointed to the right, intercept a blue ball. Otherwise, intercept a red ball.'
    }, {
      id: 20,
      name: 'Symbiosis',
      code: '-KKE2EKE2EKKKKKE7E_II2A6C7A4A8A',
      trigger: 'left',
      objective: 'If the top bit OR the bottom bit start pointed to the right, intercept a blue ball. Otherwise, intercept a red ball.'
    }, {
      id: 21,
      name: 'Quantum Number',
      code: '-C3GB1A1FC3GB1A1FC3GB1A1FC3GB1A1FC1GD1FK_II0F2A6A7A4A8A',
      trigger: 'left',
      objective: ' Use register A to count the number of blue balls. (Use 15 or fewer balls.) See the puzzle book for further details. See the puzzle book for further details.'
    }, {
      id: 22,
      name: 'Depletion',
      code: '-C2GB0A0FC2GB0A0FC2GB0A0FC2GB0A0FC0GB0HK_II0E2A6A7A4A8A',
      trigger: 'left',
      objective: 'Register A starts at 15. Subtract the number of blue balls from the register. (Use 15 or fewer balls.) See the puzzle book for further details.'
    }, {
      id: 23,
      name: 'Tetrad',
      code: '-C2GB0A0FA1A2GB0A0FA1A2GB0A7FA1IB0HA1IB0HK_II0A2A6A7A4A8A',
      trigger: 'left',
      output: 'bbbb',
      objective: 'Let exactly 4 blue balls reach the end. (Intercept the 5th.)'
    }, {
      id: 24,
      name: 'Ennead',
      code: '-C2GKC2GKC2GKC2GKKKK_MM0O2A6A7B4A8A',
      trigger: 'left',
      output: 'bbbbbbbbb',
      objective: 'Let exactly 9 blue balls reach the end. (Intercept the 10th.)'
    }, {
      id: 25,
      name: 'Regular Expression',
      code: '-KKKKKKKKKKK_II2F6A7B4A8A',
      trigger: 'left',
      output: 'rrrbbbbbbb',
      objective: 'Generate the required pattern.'
    }, {
      id: 26,
      name: 'Nucleus',
      code: '-G2CH7BKKKKKKKKK_KK2C6C7A4A8A',
      trigger: 'left',
      output: 'bbbbrbbbb',
      objective: 'Generate the required pattern.'
    }, {
      id: 27,
      name: 'Reflection',
      code: '-G2CB2HE2EB2HE2EB2HE2EB2HE2EKK_II2B6A7B4A8A',
      objective: 'Reverse the direction of each of the 9 starting bits, regardless of the direction they point to start.'
    }, {
      id: 28,
      name: 'Latch',
      code: '-C1C0CD1A0DE4EKC1C0CD0A1DC1C0CD0A1DC1C0CD0A1DK_II0B2A6A7A4B8B',
      trigger: 'left',
      output: 'bbbbbbbb',
      objective: 'Release only the blue balls.'
    }, {
      id: 29,
      name: 'One Shot Switch',
      code: '-C4GKKKKKKKKKK_II2A6B7A4B8B',
      trigger: 'left',
      output: 'bbbbbbbrb',
      objective: 'Release a blue ball, a red ball, and then the rest of the blue balls.'
    }, {
      id: 30,
      name: 'Overflow',
      code: '-C3GKC3GKC3GB5HKKKKK_UA0O2A6A7A4B8B',
      trigger: 'left',
      objective: 'Count the blue balls in register A. If there are more than 7, gear bit OV must flip right (and stay right) to indicate the overflow. See the puzzle book for further details.'
    }];

    /* src/svelte/Menu.svelte generated by Svelte v3.20.1 */
    const file$8 = "src/svelte/Menu.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (131:0) {#if visible}
    function create_if_block$6(ctx) {
    	let div0;
    	let div0_transition;
    	let t0;
    	let div1;
    	let button0;
    	let t2;
    	let t3;
    	let button1;
    	let t4;
    	let span;
    	let t6;
    	let t7;
    	let t8;
    	let a;
    	let t9;
    	let a_href_value;
    	let div1_transition;
    	let current;
    	let dispose;
    	let if_block0 = /*$rooms*/ ctx[3] && create_if_block_2$1(ctx);
    	let if_block1 = /*showChallenges*/ ctx[1] && create_if_block_1$1(ctx);

    	const shareurl = new ShareURL({
    			props: {
    				textFunction: /*shareBoardURL*/ ctx[10],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	shareurl.$on("close", /*closeMenu*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Clear Board";
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			button1 = element("button");
    			t4 = text("Challenges ");
    			span = element("span");
    			span.textContent = ">";
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			create_component(shareurl.$$.fragment);
    			t8 = space();
    			a = element("a");
    			t9 = text("About");
    			attr_dev(div0, "id", "cover");
    			attr_dev(div0, "class", "svelte-1sxu4p1");
    			add_location(div0, file$8, 131, 0, 4240);
    			attr_dev(button0, "class", "svelte-1sxu4p1");
    			add_location(button0, file$8, 133, 2, 4364);
    			attr_dev(span, "class", "arrow svelte-1sxu4p1");
    			toggle_class(span, "up", /*showChallenges*/ ctx[1]);
    			add_location(span, file$8, 142, 73, 4878);
    			attr_dev(button1, "class", "svelte-1sxu4p1");
    			add_location(button1, file$8, 142, 2, 4807);
    			attr_dev(a, "class", "btn svelte-1sxu4p1");
    			attr_dev(a, "href", a_href_value = "" + (/*$basePath*/ ctx[4] + "about.html"));
    			add_location(a, file$8, 154, 2, 5375);
    			attr_dev(div1, "id", "menu");
    			attr_dev(div1, "class", "svelte-1sxu4p1");
    			add_location(div1, file$8, 132, 0, 4300);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(div1, t2);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(button1, t4);
    			append_dev(button1, span);
    			append_dev(div1, t6);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t7);
    			mount_component(shareurl, div1, null);
    			append_dev(div1, t8);
    			append_dev(div1, a);
    			append_dev(a, t9);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div0, "click", /*closeMenu*/ ctx[8], false, false, false),
    				listen_dev(button0, "click", prevent_default(/*click_handler_1*/ ctx[17]), false, true, false),
    				listen_dev(button1, "click", /*click_handler_2*/ ctx[18], false, false, false),
    				listen_dev(a, "click", prevent_default(/*showAboutModal*/ ctx[9]), false, true, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (/*$rooms*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*showChallenges*/ 2) {
    				toggle_class(span, "up", /*showChallenges*/ ctx[1]);
    			}

    			if (/*showChallenges*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t7);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const shareurl_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				shareurl_changes.$$scope = { dirty, ctx };
    			}

    			shareurl.$set(shareurl_changes);

    			if (!current || dirty & /*$basePath*/ 16 && a_href_value !== (a_href_value = "" + (/*$basePath*/ ctx[4] + "about.html"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, true);
    				div0_transition.run(1);
    			});

    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(shareurl.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: -300, duration: 600 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, false);
    			div0_transition.run(0);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(shareurl.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: -300, duration: 600 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(shareurl);
    			if (detaching && div1_transition) div1_transition.end();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(131:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (135:2) {#if $rooms}
    function create_if_block_2$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$1, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*$socket*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(135:2) {#if $rooms}",
    		ctx
    	});

    	return block;
    }

    // (138:4) {:else}
    function create_else_block$3(ctx) {
    	let t0;
    	let a;
    	let t1;
    	let current;
    	let dispose;

    	const shareurl = new ShareURL({
    			props: {
    				textFunction: /*shareRoomURL*/ ctx[11],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	shareurl.$on("close", /*closeMenu*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(shareurl.$$.fragment);
    			t0 = space();
    			a = element("a");
    			t1 = text("Leave Shared Room");
    			attr_dev(a, "class", "btn svelte-1sxu4p1");
    			attr_dev(a, "href", /*$basePath*/ ctx[4]);
    			add_location(a, file$8, 139, 4, 4695);
    		},
    		m: function mount(target, anchor, remount) {
    			mount_component(shareurl, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t1);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", prevent_default(/*leaveRoom*/ ctx[6]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			const shareurl_changes = {};

    			if (dirty & /*$$scope*/ 8388608) {
    				shareurl_changes.$$scope = { dirty, ctx };
    			}

    			shareurl.$set(shareurl_changes);

    			if (!current || dirty & /*$basePath*/ 16) {
    				attr_dev(a, "href", /*$basePath*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(shareurl.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(shareurl.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(shareurl, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(138:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (136:4) {#if !$socket}
    function create_if_block_3$1(ctx) {
    	let a;
    	let t;
    	let a_href_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("Start Shared Room");
    			attr_dev(a, "class", "btn svelte-1sxu4p1");
    			attr_dev(a, "href", a_href_value = "" + (/*$basePath*/ ctx[4] + "room/"));
    			add_location(a, file$8, 136, 4, 4478);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", prevent_default(/*startNewRoom*/ ctx[5]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath*/ 16 && a_href_value !== (a_href_value = "" + (/*$basePath*/ ctx[4] + "room/"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(136:4) {#if !$socket}",
    		ctx
    	});

    	return block;
    }

    // (139:4) <ShareURL textFunction={shareRoomURL} on:close={closeMenu}>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Copy Room URL To Clipboard");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(139:4) <ShareURL textFunction={shareRoomURL} on:close={closeMenu}>",
    		ctx
    	});

    	return block;
    }

    // (144:2) {#if showChallenges}
    function create_if_block_1$1(ctx) {
    	let ol;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let ol_transition;
    	let current;
    	let each_value = challenges;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*challengeId*/ ctx[22];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ol, "id", "challenges");
    			attr_dev(ol, "class", "svelte-1sxu4p1");
    			add_location(ol, file$8, 144, 2, 4970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ol, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath, challenges, setUpBoard*/ 144) {
    				const each_value = challenges;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ol, destroy_block, create_each_block$3, null, get_each_context$3);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!ol_transition) ol_transition = create_bidirectional_transition(ol, slide, {}, true);
    				ol_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!ol_transition) ol_transition = create_bidirectional_transition(ol, slide, {}, false);
    			ol_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ol);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && ol_transition) ol_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(144:2) {#if showChallenges}",
    		ctx
    	});

    	return block;
    }

    // (146:4) {#each challenges as challenge, challengeId (challengeId)}
    function create_each_block$3(key_1, ctx) {
    	let li;
    	let a;
    	let t0_value = /*challenge*/ ctx[20].name + "";
    	let t0;
    	let t1;
    	let a_href_value;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[19](/*challenge*/ ctx[20], /*challengeId*/ ctx[22], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", a_href_value = /*$basePath*/ ctx[4] + "?code=" + /*challenge*/ ctx[20].code);
    			add_location(a, file$8, 146, 8, 5079);
    			attr_dev(li, "class", "svelte-1sxu4p1");
    			add_location(li, file$8, 146, 4, 5075);
    			this.first = li;
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", prevent_default(click_handler_3), false, true, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$basePath*/ 16 && a_href_value !== (a_href_value = /*$basePath*/ ctx[4] + "?code=" + /*challenge*/ ctx[20].code)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(146:4) {#each challenges as challenge, challengeId (challengeId)}",
    		ctx
    	});

    	return block;
    }

    // (154:2) <ShareURL textFunction={shareBoardURL} on:close={closeMenu}>
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Copy Board URL To Clipboard");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(154:2) <ShareURL textFunction={shareBoardURL} on:close={closeMenu}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let button;
    	let span;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let if_block_anchor;
    	let current;
    	let dispose;
    	let if_block = /*visible*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			span.textContent = "Menu";
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span, "class", "svelte-1sxu4p1");
    			add_location(span, file$8, 126, 2, 4144);
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[4] + "images/menu.svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Menu");
    			attr_dev(img, "class", "svelte-1sxu4p1");
    			add_location(img, file$8, 127, 2, 4165);
    			attr_dev(button, "id", "menu-button");
    			attr_dev(button, "class", "svelte-1sxu4p1");
    			add_location(button, file$8, 125, 0, 4078);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(button, t1);
    			append_dev(button, img);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[16], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$basePath*/ 16 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[4] + "images/menu.svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $socket;
    	let $currentChallenge;
    	let $rooms;
    	let $basePath;
    	let $toastMessage;
    	validate_store(socket$2, "socket");
    	component_subscribe($$self, socket$2, $$value => $$invalidate(2, $socket = $$value));
    	validate_store(currentChallenge, "currentChallenge");
    	component_subscribe($$self, currentChallenge, $$value => $$invalidate(12, $currentChallenge = $$value));
    	validate_store(rooms, "rooms");
    	component_subscribe($$self, rooms, $$value => $$invalidate(3, $rooms = $$value));
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, $$value => $$invalidate(4, $basePath = $$value));
    	validate_store(toastMessage, "toastMessage");
    	component_subscribe($$self, toastMessage, $$value => $$invalidate(13, $toastMessage = $$value));
    	const dispatch = createEventDispatcher();
    	const urlParams = new URLSearchParams(window.location.search);

    	if (window.location.pathname.endsWith("room/") || window.location.pathname.endsWith("room")) {
    		if (window.location.pathname.endsWith("room")) {
    			history.pushState(null, document.title, window.location.pathname + "/");
    			basePath.update();
    		}

    		decode$2();
    		socket$2.connect(urlParams.get("uuid"));
    		set_store_value(rooms, $rooms = true);
    	} else {
    		decode$2(urlParams.get("code"));

    		onMount(() => {
    			let newId = urlParams.has("id") ? urlParams.get("id") - 1 : false;

    			if (newId && newId < challenges.length) {
    				set_store_value(currentChallenge, $currentChallenge = challenges[newId]);
    				document.title = "Tumble Together - " + $currentChallenge.name;
    				dispatch("instructionModal");
    			}

    			fetch($basePath + "room/", { method: "HEAD" }).then(response => {
    				set_store_value(rooms, $rooms = response.ok);
    			});
    		});
    	}

    	function startNewRoom() {
    		if (!$socket) socket$2.connect(false, encode$2());
    		if (!window.location.pathname.endsWith("room/")) history.pushState(null, document.title, $basePath + "room/");
    		closeMenu();
    		basePath.update();
    	}

    	function leaveRoom() {
    		if ($socket) socket$2.disconnect();
    		history.pushState(null, document.title, $basePath);
    		set_store_value(toastMessage, $toastMessage = "Left shared room.");
    		closeMenu();
    		basePath.update();
    	}

    	function setUpBoard(newChallenge, id) {
    		// Loads selected challenge, updates the title, and sends the challenge Id to other players if sockets.io is connected.
    		let code = false;

    		if (newChallenge) {
    			code = newChallenge.code;
    			set_store_value(currentChallenge, $currentChallenge = newChallenge);
    			document.title = "Tumble Together - " + $currentChallenge.name;
    			if ($socket) $socket.emit("challenge", id);
    			dispatch("instructionModal");
    		} else {
    			set_store_value(currentChallenge, $currentChallenge = false);
    			document.title = "Tumble Together";
    			if ($socket) $socket.emit("challenge", false);
    		}

    		decode$2(code);

    		if (!socket$2.sendBoard()) {
    			let url = $basePath;
    			if (code) url += "?code=" + code + "&id=" + (id + 1);
    			history.pushState(null, document.title, url);
    			basePath.update();
    		}

    		closeMenu();
    	}

    	let visible = false;
    	let showChallenges = false;

    	function closeMenu() {
    		$$invalidate(0, visible = false);
    	}

    	function showAboutModal() {
    		dispatch("aboutModal");
    		closeMenu();
    	}

    	function shareBoardURL() {
    		let code = encode$2();
    		let pathname = window.location.pathname;
    		if (pathname.endsWith("room/")) pathname = pathname.slice(0, -("room/").length);
    		if (pathname.endsWith("about/")) pathname = pathname.slice(0, -("about/").length);
    		if (pathname.endsWith("room")) pathname = pathname.slice(0, -("room").length);
    		if (pathname.endsWith("about")) pathname = pathname.slice(0, -("about").length);
    		let challengeId = $currentChallenge ? "&id=" + $currentChallenge.id : "";
    		set_store_value(toastMessage, $toastMessage = "Board URL copied to clipboard.");
    		return `${window.location.origin}${pathname}?code=${code}${challengeId}`;
    	}

    	function shareRoomURL() {
    		set_store_value(toastMessage, $toastMessage = "Room URL copied to clipboard.");
    		return window.location.origin + window.location.pathname + window.location.search;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Menu", $$slots, []);
    	const click_handler = () => $$invalidate(0, visible = !visible);
    	const click_handler_1 = () => setUpBoard();
    	const click_handler_2 = () => $$invalidate(1, showChallenges = !showChallenges);
    	const click_handler_3 = (challenge, challengeId) => setUpBoard(challenge, challengeId);

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		slide,
    		createEventDispatcher,
    		onMount,
    		ShareURL,
    		challenges,
    		currentChallenge,
    		rooms,
    		basePath,
    		toastMessage,
    		socket: socket$2,
    		decode: decode$2,
    		encode: encode$2,
    		dispatch,
    		urlParams,
    		startNewRoom,
    		leaveRoom,
    		setUpBoard,
    		visible,
    		showChallenges,
    		closeMenu,
    		showAboutModal,
    		shareBoardURL,
    		shareRoomURL,
    		$socket,
    		$currentChallenge,
    		$rooms,
    		$basePath,
    		$toastMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("showChallenges" in $$props) $$invalidate(1, showChallenges = $$props.showChallenges);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$socket, $currentChallenge*/ 4100) {
    			 if ($socket) $socket.on("challenge", id => {
    				// If the challenge is changed by another player, updates the current challenge and title.
    				if (id && id < challenges.length) {
    					set_store_value(currentChallenge, $currentChallenge = challenges[id]);
    					document.title = "Tumble Together - " + $currentChallenge.name;
    					dispatch("instructionModal");
    				} else {
    					set_store_value(currentChallenge, $currentChallenge = false);
    					document.title = "Tumble Together";
    				}
    			});
    		}
    	};

    	return [
    		visible,
    		showChallenges,
    		$socket,
    		$rooms,
    		$basePath,
    		startNewRoom,
    		leaveRoom,
    		setUpBoard,
    		closeMenu,
    		showAboutModal,
    		shareBoardURL,
    		shareRoomURL,
    		$currentChallenge,
    		$toastMessage,
    		dispatch,
    		urlParams,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/svelte/AboutModal.svelte generated by Svelte v3.20.1 */
    const file$9 = "src/svelte/AboutModal.svelte";

    // (39:0) <Modal title='About Tumble Together' bind:visible on:close={closeModal}>
    function create_default_slot$4(ctx) {
    	let article;
    	let p0;
    	let t0;
    	let a0;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let a1;
    	let t6;
    	let a2;
    	let t8;
    	let a3;
    	let t10;
    	let a4;
    	let t12;
    	let t13;
    	let p2;

    	const block = {
    		c: function create() {
    			article = element("article");
    			p0 = element("p");
    			t0 = text("Tumble Together is a web-based emulator for the ");
    			a0 = element("a");
    			a0.textContent = "Turing Tumble";
    			t2 = text(" marble-powered mechanical computer to help build, test and share designs. Tumble Together allows users to quickly share challenges and solutions, and is a useful companion for using the Turing Tumble to teach kids about computer science.");
    			t3 = space();
    			p1 = element("p");
    			t4 = text("The full source code, including instructions on how to run it can be found ");
    			a1 = element("a");
    			a1.textContent = "here on GitHub";
    			t6 = text(". The client side app built with ");
    			a2 = element("a");
    			a2.textContent = "Svelte.js";
    			t8 = text(" can be run independently to create and share designs. An optional server side implementation allows a group of users to collaborate in real time on a shared Turing Tumble board remotely, using ");
    			a3 = element("a");
    			a3.textContent = "Express.js";
    			t10 = text(" and ");
    			a4 = element("a");
    			a4.textContent = "Socket.IO";
    			t12 = text(" on a Node.js server.");
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Tumble Together was built by Richard Twilton, in order to help his nephew learn with his Turing Tumble remotely during the Covid-19 Pandemic.";
    			attr_dev(a0, "href", "https://www.turingtumble.com/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$9, 40, 57, 1152);
    			attr_dev(p0, "class", "svelte-3mg6xs");
    			add_location(p0, file$9, 40, 6, 1101);
    			attr_dev(a1, "href", "https://github.com/ASquirrelsTail/tumble-together");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$9, 41, 84, 1552);
    			attr_dev(a2, "href", "https://svelte.dev/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$9, 41, 211, 1679);
    			attr_dev(a3, "href", "https://expressjs.com/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$9, 41, 464, 1932);
    			attr_dev(a4, "href", "https://socket.io/");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$9, 41, 532, 2000);
    			attr_dev(p1, "class", "svelte-3mg6xs");
    			add_location(p1, file$9, 41, 6, 1474);
    			attr_dev(p2, "class", "svelte-3mg6xs");
    			add_location(p2, file$9, 42, 6, 2090);
    			add_location(article, file$9, 39, 4, 1085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, p0);
    			append_dev(p0, t0);
    			append_dev(p0, a0);
    			append_dev(p0, t2);
    			append_dev(article, t3);
    			append_dev(article, p1);
    			append_dev(p1, t4);
    			append_dev(p1, a1);
    			append_dev(p1, t6);
    			append_dev(p1, a2);
    			append_dev(p1, t8);
    			append_dev(p1, a3);
    			append_dev(p1, t10);
    			append_dev(p1, a4);
    			append_dev(p1, t12);
    			append_dev(article, t13);
    			append_dev(article, p2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(39:0) <Modal title='About Tumble Together' bind:visible on:close={closeModal}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let updating_visible;
    	let current;

    	function modal_visible_binding(value) {
    		/*modal_visible_binding*/ ctx[7].call(null, value);
    	}

    	let modal_props = {
    		title: "About Tumble Together",
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[0] !== void 0) {
    		modal_props.visible = /*visible*/ ctx[0];
    	}

    	const modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "visible", modal_visible_binding));
    	modal.$on("close", /*closeModal*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 1) {
    				updating_visible = true;
    				modal_changes.visible = /*visible*/ ctx[0];
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const path = "about";

    function instance$9($$self, $$props, $$invalidate) {
    	let $basePath;
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, $$value => $$invalidate(5, $basePath = $$value));
    	let { visible = false } = $$props;
    	let oldPath = window.location.pathname;
    	let oldQuery = window.location.search;
    	let oldTitle = document.title;
    	if (window.location.pathname.endsWith(path) || window.location.pathname.endsWith(path + "/")) visible = true;

    	function openModal() {
    		// Open modal and set current location to About.
    		oldPath = window.location.pathname;

    		oldQuery = window.location.search;
    		oldTitle = document.title;
    		if (oldPath.endsWith(path) || oldPath.endsWith(path + "/")) oldPath = $basePath;
    		let pathname = $basePath + path + "/";
    		document.title = "Tumble Together - About";
    		history.pushState(null, document.title, pathname);
    		basePath.update();
    	}

    	function closeModal() {
    		document.title = oldTitle;
    		history.pushState(null, oldTitle, oldPath + oldQuery);
    		basePath.update();
    	}

    	const writable_props = ["visible"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AboutModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AboutModal", $$slots, []);

    	function modal_visible_binding(value) {
    		visible = value;
    		$$invalidate(0, visible);
    	}

    	$$self.$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({
    		Modal,
    		basePath,
    		visible,
    		path,
    		oldPath,
    		oldQuery,
    		oldTitle,
    		openModal,
    		closeModal,
    		$basePath
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("oldPath" in $$props) oldPath = $$props.oldPath;
    		if ("oldQuery" in $$props) oldQuery = $$props.oldQuery;
    		if ("oldTitle" in $$props) oldTitle = $$props.oldTitle;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*visible*/ 1) {
    			 if (visible) openModal();
    		}
    	};

    	return [
    		visible,
    		closeModal,
    		oldPath,
    		oldQuery,
    		oldTitle,
    		$basePath,
    		openModal,
    		modal_visible_binding
    	];
    }

    class AboutModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutModal",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get visible() {
    		throw new Error("<AboutModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<AboutModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte/InstructionModal.svelte generated by Svelte v3.20.1 */
    const file$a = "src/svelte/InstructionModal.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (24:4) {#if $currentChallenge}
    function create_if_block_3$2(ctx) {
    	let h30;
    	let t1;
    	let p0;
    	let t2_value = /*$currentChallenge*/ ctx[2].objective + "";
    	let t2;
    	let t3;
    	let t4;
    	let h31;
    	let t6;
    	let p1;
    	let t7;
    	let t8;
    	let span;
    	let t10;
    	let if_block0 = /*$currentChallenge*/ ctx[2].output && create_if_block_5$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$currentChallenge*/ ctx[2].trigger) return create_if_block_4$1;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "Objective:";
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			h31 = element("h3");
    			h31.textContent = "Instructions";
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Use the available parts to complete the challenge. Greyed-out parts cannot be moved, but greyed-out Bits and Gear Bits can be flipped by clicking/tapping on them. Press the ");
    			if_block1.c();
    			t8 = text(" trigger to start the marbles rolling. Press the ");
    			span = element("span");
    			span.textContent = "Reset";
    			t10 = text(" button to put the marbles back and try again.");
    			attr_dev(h30, "class", "svelte-hzv79y");
    			add_location(h30, file$a, 24, 6, 630);
    			attr_dev(p0, "class", "svelte-hzv79y");
    			add_location(p0, file$a, 25, 6, 656);
    			attr_dev(h31, "class", "svelte-hzv79y");
    			add_location(h31, file$a, 34, 6, 978);
    			attr_dev(span, "class", "orbitron svelte-hzv79y");
    			add_location(span, file$a, 35, 307, 1307);
    			attr_dev(p1, "class", "svelte-hzv79y");
    			add_location(p1, file$a, 35, 6, 1006);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t7);
    			if_block1.m(p1, null);
    			append_dev(p1, t8);
    			append_dev(p1, span);
    			append_dev(p1, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$currentChallenge*/ 4 && t2_value !== (t2_value = /*$currentChallenge*/ ctx[2].objective + "")) set_data_dev(t2, t2_value);

    			if (/*$currentChallenge*/ ctx[2].output) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$1(ctx);
    					if_block0.c();
    					if_block0.m(t4.parentNode, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(p1, t8);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p1);
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(24:4) {#if $currentChallenge}",
    		ctx
    	});

    	return block;
    }

    // (27:6) {#if $currentChallenge.output}
    function create_if_block_5$1(ctx) {
    	let h3;
    	let t1;
    	let p;
    	let each_value = /*$currentChallenge*/ ctx[2].output;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Required Output:";
    			t1 = space();
    			p = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "svelte-hzv79y");
    			add_location(h3, file$a, 27, 8, 738);
    			attr_dev(p, "class", "svelte-hzv79y");
    			add_location(p, file$a, 28, 8, 772);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath, $currentChallenge*/ 12) {
    				each_value = /*$currentChallenge*/ ctx[2].output;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(27:6) {#if $currentChallenge.output}",
    		ctx
    	});

    	return block;
    }

    // (30:10) {#each $currentChallenge.output as marble }
    function create_each_block$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/marble" + (/*marble*/ ctx[9] === "b" ? "blue" : "red") + ".svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Marble");
    			add_location(img, file$a, 30, 12, 842);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath, $currentChallenge*/ 12 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/marble" + (/*marble*/ ctx[9] === "b" ? "blue" : "red") + ".svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(30:10) {#each $currentChallenge.output as marble }",
    		ctx
    	});

    	return block;
    }

    // (36:240) {:else}
    function create_else_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("either");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(36:240) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:182) {#if $currentChallenge.trigger}
    function create_if_block_4$1(ctx) {
    	let t_value = /*$currentChallenge*/ ctx[2].trigger + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$currentChallenge*/ 4 && t_value !== (t_value = /*$currentChallenge*/ ctx[2].trigger + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(36:182) {#if $currentChallenge.trigger}",
    		ctx
    	});

    	return block;
    }

    // (39:4) {#if !$currentChallenge}
    function create_if_block_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("You can set the number of available parts in the box by clicking or tapping the corresponding part.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(39:4) {#if !$currentChallenge}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if !$currentChallenge}
    function create_if_block_1$2(ctx) {
    	let p;
    	let t0;
    	let span;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("To start the marbles rolling press the trigger on the side you would like to start with. To put the marbles back to the start, or end the run early, press the ");
    			span = element("span");
    			span.textContent = "Reset";
    			t2 = text(" button in the bottom right. You can change the number of marbles by clicking/tapping the marbles at the top of the board.");
    			attr_dev(span, "class", "orbitron svelte-hzv79y");
    			add_location(span, file$a, 43, 168, 2028);
    			attr_dev(p, "class", "svelte-hzv79y");
    			add_location(p, file$a, 43, 6, 1866);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, span);
    			append_dev(p, t2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(43:4) {#if !$currentChallenge}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if $rooms}
    function create_if_block$7(ctx) {
    	let p;
    	let t0;
    	let span;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("To work together with friends you can start a shared room from the ");
    			span = element("span");
    			t1 = text("Menu ");
    			img = element("img");
    			t2 = text(" and send the link to others to work on he same board, tackle challenges together and share changes in real time. Use the menu to leave a shared room as well.");
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/menu.svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Menu");
    			attr_dev(img, "class", "svelte-hzv79y");
    			add_location(img, file$a, 47, 104, 2594);
    			attr_dev(span, "class", "orbitron svelte-hzv79y");
    			add_location(span, file$a, 47, 76, 2566);
    			attr_dev(p, "class", "svelte-hzv79y");
    			add_location(p, file$a, 47, 6, 2496);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, span);
    			append_dev(span, t1);
    			append_dev(span, img);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$basePath*/ 8 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/menu.svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(47:4) {#if $rooms}",
    		ctx
    	});

    	return block;
    }

    // (22:0) <Modal {title} bind:visible>
    function create_default_slot$5(ctx) {
    	let article;
    	let t0;
    	let p0;
    	let t1;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let span0;
    	let t5;
    	let img;
    	let img_src_value;
    	let t6;
    	let t7;
    	let t8;
    	let p2;
    	let t9;
    	let span1;
    	let t11;
    	let t12;
    	let p3;
    	let t13;
    	let a0;
    	let t15;
    	let a1;
    	let t16;
    	let a1_href_value;
    	let dispose;
    	let if_block0 = /*$currentChallenge*/ ctx[2] && create_if_block_3$2(ctx);
    	let if_block1 = !/*$currentChallenge*/ ctx[2] && create_if_block_2$2(ctx);
    	let if_block2 = !/*$currentChallenge*/ ctx[2] && create_if_block_1$2(ctx);
    	let if_block3 = /*$rooms*/ ctx[4] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			p0 = element("p");
    			t1 = text("New parts can be dragged from the box and placed on the board. Most parts require a slot (or smile) to fit on the board, only the Red Gears can be placed on pegs without a slot. To flip a part simply tap/click on it once. To remove a part from drag it off the board.\n    ");
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			p1 = element("p");
    			t4 = text("A collection of ready made challenges can be found in the ");
    			span0 = element("span");
    			t5 = text("Menu ");
    			img = element("img");
    			t6 = text(" in the top right, as well as buttons to clear the board and copy the current board to a URL you can share with others.");
    			t7 = space();
    			if (if_block3) if_block3.c();
    			t8 = space();
    			p2 = element("p");
    			t9 = text("You can return to these instructions at any time by clicking the ");
    			span1 = element("span");
    			span1.textContent = "Instructions ?";
    			t11 = text(" button in the top right");
    			t12 = space();
    			p3 = element("p");
    			t13 = text("More information about Tumble Together and the ");
    			a0 = element("a");
    			a0.textContent = "Turing Tumble";
    			t15 = text(" can be found on ");
    			a1 = element("a");
    			t16 = text("the about page.");
    			attr_dev(p0, "class", "svelte-hzv79y");
    			add_location(p0, file$a, 37, 4, 1407);
    			if (img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/menu.svg"))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Menu");
    			attr_dev(img, "class", "svelte-hzv79y");
    			add_location(img, file$a, 45, 93, 2293);
    			attr_dev(span0, "class", "orbitron svelte-hzv79y");
    			add_location(span0, file$a, 45, 65, 2265);
    			attr_dev(p1, "class", "svelte-hzv79y");
    			add_location(p1, file$a, 45, 4, 2204);
    			attr_dev(span1, "class", "orbitron svelte-hzv79y");
    			add_location(span1, file$a, 49, 72, 2895);
    			attr_dev(p2, "class", "svelte-hzv79y");
    			add_location(p2, file$a, 49, 4, 2827);
    			attr_dev(a0, "href", "https://www.turingtumble.com/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$a, 50, 54, 3022);
    			attr_dev(a1, "href", a1_href_value = "" + (/*$basePath*/ ctx[3] + "about/"));
    			add_location(a1, file$a, 50, 144, 3112);
    			attr_dev(p3, "class", "svelte-hzv79y");
    			add_location(p3, file$a, 50, 4, 2972);
    			add_location(article, file$a, 22, 2, 586);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, article, anchor);
    			if (if_block0) if_block0.m(article, null);
    			append_dev(article, t0);
    			append_dev(article, p0);
    			append_dev(p0, t1);
    			if (if_block1) if_block1.m(p0, null);
    			append_dev(article, t2);
    			if (if_block2) if_block2.m(article, null);
    			append_dev(article, t3);
    			append_dev(article, p1);
    			append_dev(p1, t4);
    			append_dev(p1, span0);
    			append_dev(span0, t5);
    			append_dev(span0, img);
    			append_dev(p1, t6);
    			append_dev(article, t7);
    			if (if_block3) if_block3.m(article, null);
    			append_dev(article, t8);
    			append_dev(article, p2);
    			append_dev(p2, t9);
    			append_dev(p2, span1);
    			append_dev(p2, t11);
    			append_dev(article, t12);
    			append_dev(article, p3);
    			append_dev(p3, t13);
    			append_dev(p3, a0);
    			append_dev(p3, t15);
    			append_dev(p3, a1);
    			append_dev(a1, t16);
    			if (remount) dispose();
    			dispose = listen_dev(a1, "click", prevent_default(/*aboutModal*/ ctx[5]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*$currentChallenge*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					if_block0.m(article, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*$currentChallenge*/ ctx[2]) {
    				if (!if_block1) {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					if_block1.m(p0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!/*$currentChallenge*/ ctx[2]) {
    				if (!if_block2) {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					if_block2.m(article, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*$basePath*/ 8 && img.src !== (img_src_value = "" + (/*$basePath*/ ctx[3] + "images/menu.svg"))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (/*$rooms*/ ctx[4]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$7(ctx);
    					if_block3.c();
    					if_block3.m(article, t8);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*$basePath*/ 8 && a1_href_value !== (a1_href_value = "" + (/*$basePath*/ ctx[3] + "about/"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(22:0) <Modal {title} bind:visible>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let updating_visible;
    	let current;

    	function modal_visible_binding(value) {
    		/*modal_visible_binding*/ ctx[8].call(null, value);
    	}

    	let modal_props = {
    		title: /*title*/ ctx[1],
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	if (/*visible*/ ctx[0] !== void 0) {
    		modal_props.visible = /*visible*/ ctx[0];
    	}

    	const modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "visible", modal_visible_binding));

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*title*/ 2) modal_changes.title = /*title*/ ctx[1];

    			if (dirty & /*$$scope, $basePath, $rooms, $currentChallenge*/ 4124) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*visible*/ 1) {
    				updating_visible = true;
    				modal_changes.visible = /*visible*/ ctx[0];
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $currentChallenge;
    	let $basePath;
    	let $rooms;
    	validate_store(currentChallenge, "currentChallenge");
    	component_subscribe($$self, currentChallenge, $$value => $$invalidate(2, $currentChallenge = $$value));
    	validate_store(basePath, "basePath");
    	component_subscribe($$self, basePath, $$value => $$invalidate(3, $basePath = $$value));
    	validate_store(rooms, "rooms");
    	component_subscribe($$self, rooms, $$value => $$invalidate(4, $rooms = $$value));
    	let { visible = false } = $$props;
    	let challengeTitle;
    	let title = "Instructions";
    	const dispatch = createEventDispatcher();

    	function aboutModal() {
    		$$invalidate(0, visible = false);
    		dispatch("aboutModal");
    	}

    	const writable_props = ["visible"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InstructionModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("InstructionModal", $$slots, []);

    	function modal_visible_binding(value) {
    		visible = value;
    		$$invalidate(0, visible);
    	}

    	$$self.$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({
    		Modal,
    		createEventDispatcher,
    		currentChallenge,
    		rooms,
    		basePath,
    		visible,
    		challengeTitle,
    		title,
    		dispatch,
    		aboutModal,
    		$currentChallenge,
    		$basePath,
    		$rooms
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("challengeTitle" in $$props) $$invalidate(6, challengeTitle = $$props.challengeTitle);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentChallenge*/ 4) {
    			 $$invalidate(6, challengeTitle = "Instructions - Challenge #" + $currentChallenge.id + ": " + $currentChallenge.name);
    		}

    		if ($$self.$$.dirty & /*$currentChallenge, challengeTitle*/ 68) {
    			 $$invalidate(1, title = !$currentChallenge ? "Instructions" : challengeTitle);
    		}
    	};

    	return [
    		visible,
    		title,
    		$currentChallenge,
    		$basePath,
    		$rooms,
    		aboutModal,
    		challengeTitle,
    		dispatch,
    		modal_visible_binding
    	];
    }

    class InstructionModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InstructionModal",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get visible() {
    		throw new Error("<InstructionModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<InstructionModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svelte/Toast.svelte generated by Svelte v3.20.1 */
    const file$b = "src/svelte/Toast.svelte";

    // (17:0) {#if $toastMessage}
    function create_if_block$8(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div1_transition;
    	let current;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*$toastMessage*/ ctx[0]);
    			attr_dev(div0, "class", "toast svelte-gjamjp");
    			add_location(div0, file$b, 18, 2, 386);
    			attr_dev(div1, "class", "toast-container svelte-gjamjp");
    			add_location(div1, file$b, 17, 0, 311);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div0, "click", /*clear*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$toastMessage*/ 1) set_data_dev(t, /*$toastMessage*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 300, duration: 400 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 300, duration: 400 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(17:0) {#if $toastMessage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$toastMessage*/ ctx[0] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$toastMessage*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $toastMessage;
    	validate_store(toastMessage, "toastMessage");
    	component_subscribe($$self, toastMessage, $$value => $$invalidate(0, $toastMessage = $$value));
    	let timer;

    	function clear() {
    		set_store_value(toastMessage, $toastMessage = false);
    		clearTimeout(timer);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toast> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Toast", $$slots, []);

    	$$self.$capture_state = () => ({
    		toastMessage,
    		fly,
    		timer,
    		clear,
    		$toastMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("timer" in $$props) timer = $$props.timer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$toastMessage*/ 1) {
    			 if ($toastMessage) {
    				timer = setTimeout(() => set_store_value(toastMessage, $toastMessage = false), 4000);
    			}
    		}
    	};

    	return [$toastMessage, clear];
    }

    class Toast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toast",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/svelte/App.svelte generated by Svelte v3.20.1 */
    const file$c = "src/svelte/App.svelte";

    // (16:23) {#if $socket}
    function create_if_block$9(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "- Sharing";
    			attr_dev(span, "class", "svelte-11f04ni");
    			add_location(span, file$c, 15, 37, 390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(16:23) {#if $socket}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let nav;
    	let h1;
    	let t0;
    	let t1;
    	let div;
    	let button;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let t6;
    	let t7;
    	let updating_visible;
    	let t8;
    	let updating_visible_1;
    	let t9;
    	let current;
    	let dispose;
    	let if_block = /*$socket*/ ctx[2] && create_if_block$9(ctx);
    	const menu = new Menu({ $$inline: true });
    	menu.$on("aboutModal", /*aboutModal_handler*/ ctx[4]);
    	menu.$on("instructionModal", /*instructionModal_handler*/ ctx[5]);
    	const playarea = new PlayArea({ $$inline: true });

    	function aboutmodal_visible_binding(value) {
    		/*aboutmodal_visible_binding*/ ctx[6].call(null, value);
    	}

    	let aboutmodal_props = {};

    	if (/*aboutModal*/ ctx[0] !== void 0) {
    		aboutmodal_props.visible = /*aboutModal*/ ctx[0];
    	}

    	const aboutmodal = new AboutModal({ props: aboutmodal_props, $$inline: true });
    	binding_callbacks.push(() => bind(aboutmodal, "visible", aboutmodal_visible_binding));

    	function instructionmodal_visible_binding(value) {
    		/*instructionmodal_visible_binding*/ ctx[7].call(null, value);
    	}

    	let instructionmodal_props = {};

    	if (/*instructionModal*/ ctx[1] !== void 0) {
    		instructionmodal_props.visible = /*instructionModal*/ ctx[1];
    	}

    	const instructionmodal = new InstructionModal({
    			props: instructionmodal_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(instructionmodal, "visible", instructionmodal_visible_binding));
    	instructionmodal.$on("aboutModal", /*aboutModal_handler_1*/ ctx[8]);
    	const toast = new Toast({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			h1 = element("h1");
    			t0 = text("Tumble Together! ");
    			if (if_block) if_block.c();
    			t1 = space();
    			div = element("div");
    			button = element("button");
    			span0 = element("span");
    			span0.textContent = "Instructions";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "?";
    			t5 = space();
    			create_component(menu.$$.fragment);
    			t6 = space();
    			create_component(playarea.$$.fragment);
    			t7 = space();
    			create_component(aboutmodal.$$.fragment);
    			t8 = space();
    			create_component(instructionmodal.$$.fragment);
    			t9 = space();
    			create_component(toast.$$.fragment);
    			attr_dev(h1, "class", "svelte-11f04ni");
    			add_location(h1, file$c, 15, 2, 355);
    			attr_dev(span0, "class", "title svelte-11f04ni");
    			add_location(span0, file$c, 18, 6, 518);
    			attr_dev(span1, "class", "question svelte-11f04ni");
    			add_location(span1, file$c, 19, 6, 565);
    			attr_dev(button, "id", "instructions-button");
    			attr_dev(button, "class", "svelte-11f04ni");
    			add_location(button, file$c, 17, 4, 435);
    			add_location(div, file$c, 16, 2, 425);
    			attr_dev(nav, "class", "svelte-11f04ni");
    			add_location(nav, file$c, 14, 0, 347);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, h1);
    			append_dev(h1, t0);
    			if (if_block) if_block.m(h1, null);
    			append_dev(nav, t1);
    			append_dev(nav, div);
    			append_dev(div, button);
    			append_dev(button, span0);
    			append_dev(button, t3);
    			append_dev(button, span1);
    			append_dev(div, t5);
    			mount_component(menu, div, null);
    			insert_dev(target, t6, anchor);
    			mount_component(playarea, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(aboutmodal, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(instructionmodal, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(toast, target, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$socket*/ ctx[2]) {
    				if (!if_block) {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(h1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const aboutmodal_changes = {};

    			if (!updating_visible && dirty & /*aboutModal*/ 1) {
    				updating_visible = true;
    				aboutmodal_changes.visible = /*aboutModal*/ ctx[0];
    				add_flush_callback(() => updating_visible = false);
    			}

    			aboutmodal.$set(aboutmodal_changes);
    			const instructionmodal_changes = {};

    			if (!updating_visible_1 && dirty & /*instructionModal*/ 2) {
    				updating_visible_1 = true;
    				instructionmodal_changes.visible = /*instructionModal*/ ctx[1];
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			instructionmodal.$set(instructionmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(playarea.$$.fragment, local);
    			transition_in(aboutmodal.$$.fragment, local);
    			transition_in(instructionmodal.$$.fragment, local);
    			transition_in(toast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(playarea.$$.fragment, local);
    			transition_out(aboutmodal.$$.fragment, local);
    			transition_out(instructionmodal.$$.fragment, local);
    			transition_out(toast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (if_block) if_block.d();
    			destroy_component(menu);
    			if (detaching) detach_dev(t6);
    			destroy_component(playarea, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(aboutmodal, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(instructionmodal, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(toast, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $socket;
    	validate_store(socket$2, "socket");
    	component_subscribe($$self, socket$2, $$value => $$invalidate(2, $socket = $$value));
    	let aboutModal = false;
    	let instructionModal = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => $$invalidate(1, instructionModal = true);
    	const aboutModal_handler = () => $$invalidate(0, aboutModal = true);
    	const instructionModal_handler = () => $$invalidate(1, instructionModal = true);

    	function aboutmodal_visible_binding(value) {
    		aboutModal = value;
    		$$invalidate(0, aboutModal);
    	}

    	function instructionmodal_visible_binding(value) {
    		instructionModal = value;
    		$$invalidate(1, instructionModal);
    	}

    	const aboutModal_handler_1 = () => $$invalidate(0, aboutModal = true);

    	$$self.$capture_state = () => ({
    		PlayArea,
    		Menu,
    		AboutModal,
    		InstructionModal,
    		Toast,
    		socket: socket$2,
    		aboutModal,
    		instructionModal,
    		$socket
    	});

    	$$self.$inject_state = $$props => {
    		if ("aboutModal" in $$props) $$invalidate(0, aboutModal = $$props.aboutModal);
    		if ("instructionModal" in $$props) $$invalidate(1, instructionModal = $$props.instructionModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		aboutModal,
    		instructionModal,
    		$socket,
    		click_handler,
    		aboutModal_handler,
    		instructionModal_handler,
    		aboutmodal_visible_binding,
    		instructionmodal_visible_binding,
    		aboutModal_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
